import crypto from "crypto";
import { sbSelect, sbUpdate } from "./supabase-server";

/** License key format shared with the payment verify route: PP-XXXXXXXX. */
export function generateLicenseKey(): string {
  return `PP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

interface PurchaseRow {
  id: string;
  doc_type: string;
  document_id: string | null;
}

/**
 * A license is entitled to a specific document when one of its purchases:
 *  - is a bundle (covers every document), or
 *  - is already linked to that exact document (single licenses are scoped to
 *    the document they were bought or claimed for), or
 *  - is unclaimed (document_id is null): a "pro-single" purchase ("any single
 *    document") or a single purchase of the matching doc type is claimed on
 *    first use by binding it to this document.
 */
export async function checkLicenseEntitlement(
  licenseKey: string,
  doc: { id: string; doc_type: string }
): Promise<boolean> {
  const purchases = await sbSelect<PurchaseRow>(
    "purchases",
    `license_key=eq.${encodeURIComponent(licenseKey)}&select=id,doc_type,document_id`
  );

  if (purchases.some((p) => p.doc_type === "bundle" || p.document_id === doc.id)) {
    return true;
  }

  const claimable = purchases.find(
    (p) => p.document_id === null && (p.doc_type === "pro-single" || p.doc_type === doc.doc_type)
  );
  if (!claimable) return false;

  // Claim-on-first-use: bind the purchase to this document. For "pro-single"
  // this also records the real doc type; afterwards it behaves like a normal
  // single-document license. The document_id=is.null filter makes the claim
  // atomic: of two concurrent requests, only one PATCH matches a row, so a
  // single license can never be claimed for two different documents.
  const claimed = await sbUpdate<PurchaseRow>(
    "purchases",
    `id=eq.${encodeURIComponent(claimable.id)}&document_id=is.null`,
    {
      document_id: doc.id,
      doc_type: doc.doc_type,
    }
  );
  if (claimed.length === 1) return true;

  // Lost the race: another request claimed this purchase first. Grant only if
  // it was claimed for this very document.
  const current = await sbSelect<PurchaseRow>(
    "purchases",
    `id=eq.${encodeURIComponent(claimable.id)}&select=id,doc_type,document_id`
  );
  return current[0]?.document_id === doc.id;
}
