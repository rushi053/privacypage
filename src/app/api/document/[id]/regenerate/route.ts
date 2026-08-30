import { NextRequest, NextResponse } from "next/server";
import { sbSelect, sbUpdate } from "@/lib/supabase-server";
import { checkLicenseEntitlement } from "@/lib/entitlements";
import { generateDocumentContent } from "@/lib/generate-content";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/document/[id]/regenerate  body: { licenseKey }
// Re-runs the LLM over the document's stored inputs and replaces its content -
// the "free lifetime regenerations" the pricing page promises. Entitlement
// rules are identical to the GET route (including claim-on-first-use), and the
// 404 body codes ("not_found" vs "locked") match it so document-id existence
// is never revealed to unentitled callers.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await checkRateLimit(getClientIp(req)))) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many documents generated. Please try again in an hour." },
      { status: 429 }
    );
  }

  let licenseKey: string | undefined;
  try {
    const body = await req.json();
    licenseKey = typeof body?.licenseKey === "string" ? body.licenseKey : undefined;
  } catch {
    // no/invalid JSON body -> handled below
  }
  if (!licenseKey) {
    return NextResponse.json({ error: "licenseKey required" }, { status: 401 });
  }

  let doc: { id: string; doc_type: string; inputs: Record<string, string> } | undefined;
  try {
    const rows = await sbSelect<{ id: string; doc_type: string; inputs: Record<string, string> }>(
      "documents",
      `id=eq.${encodeURIComponent(id)}&select=id,doc_type,inputs`
    );
    doc = rows[0];
  } catch (e) {
    console.error(`[regenerate:${id}] lookup failed:`, e);
    return NextResponse.json({ error: "Document lookup failed" }, { status: 500 });
  }

  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    if (!(await checkLicenseEntitlement(licenseKey, doc))) {
      return NextResponse.json({ error: "locked" }, { status: 404 });
    }
  } catch (e) {
    console.error(`[regenerate:${id}] entitlement check failed:`, e);
    return NextResponse.json({ error: "Entitlement check failed" }, { status: 500 });
  }

  const content = await generateDocumentContent(doc.doc_type, doc.inputs ?? {});
  if (!content) {
    return NextResponse.json(
      { error: "Regeneration is temporarily unavailable. Please try again in a moment." },
      { status: 502 }
    );
  }

  try {
    await sbUpdate("documents", `id=eq.${encodeURIComponent(id)}`, { content });
  } catch (e) {
    console.error(`[regenerate:${id}] content update failed:`, e);
    return NextResponse.json({ error: "Could not save the regenerated document" }, { status: 500 });
  }

  return NextResponse.json({ content, docType: doc.doc_type });
}
