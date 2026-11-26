/**
 * Pure guard for POST /api/license/verify.
 *
 * The route is a read-only lookup. This module decides whether the body is
 * safe to turn into a PostgREST filter. It does not query anything.
 *
 * Issued keys are `PP-` plus 8 uppercase hex characters. That is the string
 * generateLicenseKey() in entitlements.ts builds
 * (`PP-${randomBytes(4).toString("hex").toUpperCase()}`), and the shape
 * document-id.ts documents. There is no shared regex in those modules; this
 * pattern matches that generator and does not accept a looser format.
 * Email is trimmed only. It is not lowercased and its match behavior is
 * unchanged.
 */

/**
 * Same cap as LICENSE_KEY_MAX_CHARS in document-id.ts. Kept as a local
 * constant so this module has no relative import: the node --test scripts
 * load it with type stripping, which does not resolve extensionless paths.
 * scripts/check-license-request.mjs asserts the two stay equal.
 */
export const LICENSE_KEY_MAX_CHARS = 64;

/** RFC 5321 path limit. Longer values are rejected before the lookup. */
export const EMAIL_MAX_CHARS = 254;

const LICENSE_KEY_PATTERN = /^PP-[0-9A-F]{8}$/;

export type LicenseLookup =
  | { by: "licenseKey"; licenseKey: string }
  | { by: "email"; email: string };

export type LicenseRequestResult =
  | { ok: true; lookup: LicenseLookup }
  | { ok: false; status: 400; body: { error: string } };

export type LicenseRequestSource = {
  text(): Promise<string>;
};

function invalid(error: string): LicenseRequestResult {
  return { ok: false, status: 400, body: { error } };
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Absent, or a string that is empty after trim, counts as missing.
 * Any other non-string is rejected. Over-long strings are rejected
 * before a license key is checked against PP-XXXXXXXX.
 */
function readOptionalString(
  body: Record<string, unknown>,
  key: "licenseKey" | "email",
  maxChars: number
): { ok: true; value?: string } | { ok: false; error: string } {
  if (!Object.hasOwn(body, key)) return { ok: true };
  const value = body[key];
  if (typeof value !== "string") {
    return { ok: false, error: `${key} must be a string.` };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return { ok: true };
  if (trimmed.length > maxChars) {
    return { ok: false, error: `${key} must be at most ${maxChars} characters.` };
  }
  return { ok: true, value: trimmed };
}

/** Parse an already-read body. Malformed JSON and non-objects are 400. */
export function parseLicenseRequest(raw: string): LicenseRequestResult {
  if (raw.trim() === "") {
    return invalid("Request body is not valid JSON.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return invalid("Request body is not valid JSON.");
  }

  if (!isJsonObject(parsed)) {
    return invalid("Request body must be a JSON object.");
  }

  const licenseKey = readOptionalString(parsed, "licenseKey", LICENSE_KEY_MAX_CHARS);
  if (!licenseKey.ok) return invalid(licenseKey.error);
  const email = readOptionalString(parsed, "email", EMAIL_MAX_CHARS);
  if (!email.ok) return invalid(email.error);

  if (licenseKey.value !== undefined) {
    if (!LICENSE_KEY_PATTERN.test(licenseKey.value)) {
      return invalid("License key must be in the form PP-XXXXXXXX.");
    }
    return { ok: true, lookup: { by: "licenseKey", licenseKey: licenseKey.value } };
  }

  if (email.value !== undefined) {
    return { ok: true, lookup: { by: "email", email: email.value } };
  }

  return invalid("License key or email required");
}

/** Read the body, then parse it. A thrown read is the same 400 as bad JSON. */
export async function readLicenseRequest(req: LicenseRequestSource): Promise<LicenseRequestResult> {
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return invalid("Request body is not valid JSON.");
  }
  return parseLicenseRequest(raw);
}
