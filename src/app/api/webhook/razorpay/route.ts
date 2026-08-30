import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { redeemPurchase, RedeemError } from "@/lib/redeem";

interface PaymentEntity {
  id?: string;
  order_id?: string;
  email?: string | null;
  notes?: Record<string, string> | null;
}

/**
 * Razorpay webhook - safety net for payments where the client never completed
 * the verify call (closed tab, network drop). payment.captured redeems the
 * order through the same idempotent path as verify, so double-processing an
 * order the client already verified is harmless.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook/razorpay] RAZORPAY_WEBHOOK_SECRET is not set - webhook cannot be verified");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  // The signature covers the raw body bytes, so read the text before parsing.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (signatureBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Signature verified. Response codes drive Razorpay's retry behavior:
  // 200 for success, idempotent duplicates, and permanent errors (malformed
  // event, bad receipt/docType) where a retry can never succeed; 500 for
  // transient processing failures (Supabase/Razorpay hiccups) so Razorpay
  // keeps retrying over its 24h window. Redeem is idempotent, so retries of
  // an order that eventually succeeded are harmless.
  let event: { event?: string; payload?: { payment?: { entity?: PaymentEntity } } };
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    console.error("[webhook/razorpay] malformed event body:", e);
    return NextResponse.json({ received: true });
  }

  try {
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      // redeemPurchase falls back to the order's notes.email when absent here.
      const email = payment?.email || payment?.notes?.email || undefined;

      if (orderId && paymentId) {
        const { licenseKey, alreadyExisted } = await redeemPurchase({ orderId, paymentId, email });
        console.log(
          `[webhook/razorpay] payment.captured processed: order=${orderId} alreadyExisted=${alreadyExisted} license=${licenseKey.slice(0, 5)}...`
        );
      } else {
        console.error("[webhook/razorpay] payment.captured missing order_id or payment id:", payment);
      }
    }
  } catch (e) {
    if (e instanceof RedeemError && e.status < 500) {
      // Semantic/permanent failure (e.g. unrecognizable receipt): retrying
      // the exact same event can never succeed, so acknowledge it.
      console.error("[webhook/razorpay] permanent processing failure (not retrying):", e);
      return NextResponse.json({ received: true });
    }
    console.error("[webhook/razorpay] transient processing failure - returning 500 for Razorpay retry:", e);
    return NextResponse.json({ error: "Processing failed, please retry" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
