import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { redeemPurchase, RedeemError } from "@/lib/redeem";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, docType, documentId } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ verified: false, error: "Payment not configured" }, { status: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const signatureBuf = Buffer.from(String(razorpay_signature ?? ""));
    const expectedBuf = Buffer.from(expectedSignature);
    if (signatureBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
      return NextResponse.json({ verified: false, error: "Invalid signature" }, { status: 400 });
    }

    const { licenseKey } = await redeemPurchase({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      email,
      documentId,
      expectedDocType: docType,
    });

    return NextResponse.json({ verified: true, licenseKey });
  } catch (error) {
    if (error instanceof RedeemError) {
      return NextResponse.json({ verified: false, error: error.message }, { status: error.status });
    }
    console.error("Verify error:", error);
    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 500 });
  }
}
