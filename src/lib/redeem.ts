import { sbInsert, sbSelect } from "./supabase-server";
import { generateLicenseKey } from "./entitlements";
import { sendLicenseEmail } from "./email";

/**
 * A redemption failure that maps to an HTTP response. The verify route
 * surfaces status/message to the client; the webhook acknowledges permanent
 * failures (status < 500) with a 200 and returns 500 for transient ones so
 * Razorpay retries them.
 */
export class RedeemError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "RedeemError";
  }
}

export interface RedeemParams {
  orderId: string;
  paymentId: string;
  email?: string;
  /** Client-supplied document to link the purchase to (validated against documents). */
  documentId?: string;
  /**
   * When set (verify route), the redemption fails if the docType derived from
   * the paid order's receipt doesn't match what the client claims it bought.
   */
  expectedDocType?: string;
}

export interface RedeemOutcome {
  licenseKey: string;
  docType: string;
  /** True when this order was already redeemed (idempotent re-verify / webhook replay). */
  alreadyExisted: boolean;
}

/**
 * Shared purchase-redemption path for the verify route and the Razorpay
 * webhook. Fetches the order back from Razorpay (never trusts client-declared
 * docType/amount), derives docType from the receipt, and idempotently records
 * the purchase (razorpay_order_id is unique - a duplicate insert re-selects
 * the existing row and returns its license key).
 */
export async function redeemPurchase({
  orderId,
  paymentId,
  email,
  documentId,
  expectedDocType,
}: RedeemParams): Promise<RedeemOutcome> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new RedeemError(500, "Payment not configured");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!orderRes.ok) {
    const detail = await orderRes.text().catch(() => "<unreadable>");
    console.error("[redeem] Razorpay order fetch failed:", orderRes.status, detail);
    throw new RedeemError(502, "Could not verify the order with Razorpay");
  }
  const order: {
    receipt?: string;
    amount?: number;
    currency?: string;
    notes?: Record<string, string> | null;
  } = await orderRes.json();

  // create-order stores the buyer email in the ORDER notes. The webhook's
  // payment entity often lacks an email, so fall back to the order's notes.
  const buyerEmail = email || order.notes?.email || undefined;

  // create-order sets receipt to `${docType}_${Date.now()}`. Doc types contain
  // no underscores ("pro-single" is hyphenated), so stripping only the
  // trailing _<timestamp> recovers the docType exactly.
  const orderDocType = (order.receipt ?? "").replace(/_\d+$/, "");
  if (!orderDocType) {
    throw new RedeemError(400, "Order receipt is missing or unrecognized");
  }
  if (expectedDocType !== undefined && expectedDocType !== orderDocType) {
    throw new RedeemError(400, "docType does not match the paid order");
  }

  // Link the purchase to its generated document, but only if that document
  // actually exists - a stale/bogus id would fail the FK and 500 the redeem.
  // "pro-single" purchases stay unclaimed (null document_id) until first use.
  let purchaseDocumentId: string | null = null;
  if (documentId && orderDocType !== "pro-single") {
    try {
      const docs = await sbSelect<{ id: string }>(
        "documents",
        `id=eq.${encodeURIComponent(documentId)}&select=id`
      );
      purchaseDocumentId = docs[0]?.id ?? null;
    } catch (e) {
      console.error("[redeem] document lookup failed - storing purchase without document link:", e);
    }
  }

  const licenseKey = generateLicenseKey();

  // Store the purchase server-side (service-role key). If this fails, the
  // entitlement would be lost, so surface it instead of silently swallowing.
  try {
    await sbInsert("purchases", {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      license_key: licenseKey,
      email: buyerEmail || "unknown",
      doc_type: orderDocType,
      amount: order.amount ?? 0,
      currency: order.currency ?? "USD",
      ...(purchaseDocumentId ? { document_id: purchaseDocumentId } : {}),
    });
  } catch (e) {
    // Duplicate redeem for an already-recorded order (razorpay_order_id is
    // unique): the customer already paid, so return their existing key.
    try {
      const existing = await sbSelect<{ license_key: string; doc_type: string }>(
        "purchases",
        `razorpay_order_id=eq.${encodeURIComponent(orderId)}&select=license_key,doc_type`
      );
      if (existing[0]?.license_key) {
        return {
          licenseKey: existing[0].license_key,
          docType: existing[0].doc_type,
          alreadyExisted: true,
        };
      }
    } catch {
      // fall through to the generic failure below
    }
    console.error("[redeem] purchase insert failed - payment verified but entitlement NOT recorded:", e);
    throw new RedeemError(
      500,
      "Payment received but the purchase could not be recorded. Contact support with your payment ID."
    );
  }

  // Only email on a freshly created purchase - idempotent re-verifies and
  // webhook replays of the same order must not re-send the license.
  if (buyerEmail) {
    await sendLicenseEmail({
      to: buyerEmail,
      licenseKey,
      docType: orderDocType,
      documentId: purchaseDocumentId ?? undefined,
    });
  }

  return { licenseKey, docType: orderDocType, alreadyExisted: false };
}
