/**
 * documents.id is a Postgres uuid. Only the canonical 36-character form
 * (8-4-4-4-12 hex, hyphens required) is accepted, so a junk, empty, or
 * oversized id never reaches PostgREST. Hex digits are case-insensitive.
 * Braces, urn:uuid:, and hyphen-less hex are not canonical and are rejected.
 */
const DOCUMENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isDocumentId(id: string): boolean {
  return id.length === 36 && DOCUMENT_ID_PATTERN.test(id);
}

/**
 * Issued keys are `PP-` plus 8 hex characters (11 chars). A query value or
 * body key longer than this is not a license and must not be interpolated
 * into a PostgREST filter.
 */
export const LICENSE_KEY_MAX_CHARS = 64;

export function licenseKeyExceedsLimit(license: string): boolean {
  return license.length > LICENSE_KEY_MAX_CHARS;
}
