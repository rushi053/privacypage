import { NextRequest, NextResponse } from "next/server";
import { sbSelect } from "@/lib/supabase-server";
import { checkLicenseEntitlement } from "@/lib/entitlements";
import { isDocumentId, licenseKeyExceedsLimit } from "@/lib/document-id";

// GET /api/document/[id]?license=<license key>
// Returns the full document content only when entitlement is proven.
// Missing documents and unentitled requests both return 404 so the status
// code never reveals whether a document id exists; the body carries a
// machine-readable code ("not_found" vs "locked") for the client.
// A non-uuid id is not_found before any lookup, for the same reason.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isDocumentId(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const license = req.nextUrl.searchParams.get("license");

  if (!license) {
    return NextResponse.json({ error: "license query param required" }, { status: 401 });
  }

  let doc: { id: string; doc_type: string; content: string } | undefined;
  try {
    const rows = await sbSelect<{ id: string; doc_type: string; content: string }>(
      "documents",
      `id=eq.${encodeURIComponent(id)}&select=id,doc_type,content`
    );
    doc = rows[0];
  } catch (e) {
    console.error(`[document:${id}] lookup failed:`, e);
    return NextResponse.json({ error: "Document lookup failed" }, { status: 500 });
  }

  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Longer than any issued key. Do not pass it to the entitlement query;
  // the document exists, so this is the same response as an unentitled key.
  if (licenseKeyExceedsLimit(license)) {
    return NextResponse.json({ error: "locked" }, { status: 404 });
  }

  try {
    if (await checkLicenseEntitlement(license, doc)) {
      return NextResponse.json({ content: doc.content, docType: doc.doc_type });
    }
  } catch (e) {
    console.error(`[document:${id}] entitlement check failed:`, e);
    return NextResponse.json({ error: "Entitlement check failed" }, { status: 500 });
  }
  return NextResponse.json({ error: "locked" }, { status: 404 });
}
