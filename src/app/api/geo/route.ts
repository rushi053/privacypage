import { NextRequest, NextResponse } from "next/server";
import { countryFromHeaders, getPricingForCountry } from "@/lib/currency";

/** Country (Vercel edge header) + the server-computed pricing that
 * /api/payment/create-order will charge. Never cached: it varies per visitor. */
export async function GET(req: NextRequest) {
  const country = countryFromHeaders(req.headers);
  return NextResponse.json(
    { country, pricing: getPricingForCountry(country) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
