import { NextRequest, NextResponse } from "next/server";

const VALID_PRICES: Record<string, { single: number; bundle: number }> = {
  INR: { single: 84900, bundle: 209900 },
  USD: { single: 999, bundle: 2499 },
  EUR: { single: 949, bundle: 2349 },
  GBP: { single: 799, bundle: 1999 },
};

export async function POST(req: NextRequest) {
  try {
    const { docType, currency, amount } = await req.json();

    const prices = VALID_PRICES[currency] || VALID_PRICES.USD;
    const isBundle = docType === "bundle" || docType === "pro-single";
    const expectedAmount = isBundle && docType === "bundle" ? prices.bundle : prices.single;

    if (amount !== expectedAmount) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: expectedAmount,
        currency: currency || "USD",
        receipt: `${docType}_${Date.now()}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Razorpay API error:", res.status, err);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const order = await res.json();
    return NextResponse.json({ orderId: order.id, amount: expectedAmount, currency });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
