import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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
    const isBundle = docType === "bundle";
    const expectedAmount = isBundle ? prices.bundle : prices.single;

    if (amount !== expectedAmount) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: expectedAmount,
      currency: currency || "USD",
      receipt: `${docType}_${Date.now()}`,
    });

    return NextResponse.json({ orderId: order.id, amount: expectedAmount, currency });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
