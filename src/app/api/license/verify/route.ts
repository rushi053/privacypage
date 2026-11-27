import { NextRequest, NextResponse } from "next/server";
import { readLicenseRequest } from "@/lib/license-request";
import { checkLicenseVerifyRateLimit, getClientIp } from "@/lib/rate-limit";
import { sbSelect } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  if (!(await checkLicenseVerifyRateLimit(getClientIp(req)))) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many license lookups. Please try again in a minute." },
      { status: 429 }
    );
  }

  const parsed = await readLicenseRequest(req);
  if (!parsed.ok) {
    return NextResponse.json(parsed.body, { status: parsed.status });
  }

  try {
    // purchases is RLS-locked with no policies, so this must go through the
    // service-role helpers - the anon key would silently return zero rows.
    let query = "select=doc_type,license_key,created_at";
    if (parsed.lookup.by === "licenseKey") {
      query += `&license_key=eq.${encodeURIComponent(parsed.lookup.licenseKey)}`;
    } else {
      query += `&email=eq.${encodeURIComponent(parsed.lookup.email)}&order=created_at.desc`;
    }

    const purchases = await sbSelect<{ doc_type: string; license_key: string; created_at: string }>(
      "purchases",
      query
    );

    if (purchases.length === 0) {
      return NextResponse.json({ found: false, error: "No purchase found" }, { status: 404 });
    }

    const docTypes = purchases.map((p) => ({
      docType: p.doc_type,
      licenseKey: p.license_key,
      createdAt: p.created_at,
    }));

    return NextResponse.json({ found: true, purchases: docTypes });
  } catch (error) {
    console.error("License verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
