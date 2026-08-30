import { NextRequest, NextResponse } from "next/server";

/** Country of the requester per Vercel's edge geo header (null on localhost
 * or non-Vercel hosts). The client uses it to pick INR vs USD pricing. */
export async function GET(req: NextRequest) {
  return NextResponse.json({ country: req.headers.get("x-vercel-ip-country") || null });
}
