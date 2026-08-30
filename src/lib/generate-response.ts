import { NextResponse } from "next/server";
import { sbInsert } from "./supabase-server";

const PREVIEW_LINE_COUNT = 25;

/**
 * Shared response builder for all /api/generate* routes: persists the full
 * document server-side and returns only a preview to the client.
 *
 * The legacy full-content response is returned ONLY when Supabase was never
 * configured for this deployment. Runtime storage failures must not leak the
 * full document to an unpaid client, so they fail closed with a 503.
 */
export async function respondWithGeneratedDocument(
  docType: string,
  inputs: Record<string, unknown>,
  content: string
): Promise<NextResponse> {
  const supabaseConfigured =
    !!process.env.SUPABASE_URL &&
    !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
  if (!supabaseConfigured) {
    console.error(
      `[generate:${docType}] Supabase is NOT configured - returning LEGACY full-content response. ` +
        "Full documents are exposed to the client until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set " +
        "(and supabase/migrations/001_entitlements.sql has been run)."
    );
    return NextResponse.json({ policy: content, legacyFull: true });
  }

  try {
    const rows = await sbInsert<{ id: string }>("documents", {
      doc_type: docType,
      inputs,
      content,
    });
    const documentId = rows[0]?.id;
    if (!documentId) throw new Error("documents insert returned no id");

    const lines = content.split("\n");
    return NextResponse.json({
      documentId,
      preview: lines.slice(0, PREVIEW_LINE_COUNT).join("\n"),
      totalLines: lines.length,
    });
  } catch (e) {
    console.error(`[generate:${docType}] failed to store document in Supabase:`, e);
    return NextResponse.json(
      { error: "We couldn't prepare your document right now. Please try again in a moment." },
      { status: 503 }
    );
  }
}
