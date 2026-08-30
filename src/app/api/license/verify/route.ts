import { NextRequest, NextResponse } from "next/server";
import { sbSelect } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, email } = await req.json();

    if (!licenseKey && !email) {
      return NextResponse.json({ error: "License key or email required" }, { status: 400 });
    }

    // purchases is RLS-locked with no policies, so this must go through the
    // service-role helpers - the anon key would silently return zero rows.
    let query = "select=doc_type,license_key,created_at";
    if (licenseKey) {
      query += `&license_key=eq.${encodeURIComponent(licenseKey)}`;
    } else {
      query += `&email=eq.${encodeURIComponent(email)}&order=created_at.desc`;
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
