/**
 * Guard for the document-generation POST bodies.
 *
 * The wizard (src/components/Wizard.tsx) posts one flat JSON object: a string
 * for each step in src/lib/wizardConfigs.ts, plus `docType`. Text steps are a
 * single-line `<input type="text">` (name, email, company, URL, jurisdiction).
 * Select steps send one option. Multiselect steps send the chosen labels
 * joined with ", ". There is no textarea and no nested value. Joining every
 * option on the longest step is still well under 300 characters, so every
 * field uses the same 2,000-character cap. There is no larger free-text
 * exception.
 *
 * Nested objects and arrays are rejected with 400 `invalid_body`. They are
 * not dropped: omitting a key would change what reaches the prompt and the
 * stored inputs without the client knowing. Numbers and booleans are coerced
 * with String(); strings are trimmed. A body of already-trimmed strings is
 * returned with the same keys and the same values.
 *
 * Size limit is 32 KiB (32,768 bytes). When Content-Length is a plain
 * integer it is checked before the body is read. The raw text's UTF-8 byte
 * length is always checked too, so a missing or understated Content-Length
 * cannot admit a larger body.
 */

export const DOC_REQUEST_MAX_BYTES = 32 * 1024;
export const DOC_REQUEST_MAX_FIELD_CHARS = 2_000;

export type DocRequestErrorCode =
  | "invalid_json"
  | "invalid_body"
  | "payload_too_large"
  | "field_too_long";

export type DocParseResult =
  | { ok: true; data: Record<string, string> }
  | {
      ok: false;
      status: 400 | 413;
      body: { error: DocRequestErrorCode; message: string };
    };

export type DocRequestSource = {
  headers: { get(name: string): string | null };
  text(): Promise<string>;
};

const RESERVED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function fail(
  status: 400 | 413,
  error: DocRequestErrorCode,
  message: string
): DocParseResult {
  return { ok: false, status, body: { error, message } };
}

function invalidJson(): DocParseResult {
  return fail(400, "invalid_json", "Request body is empty or is not valid JSON.");
}

function payloadTooLarge(): DocParseResult {
  return fail(413, "payload_too_large", "Request body exceeds 32 KB.");
}

/** Content-Length is an exact byte count. Anything else falls through to the raw-text check. */
function contentLengthExceeds(header: string | null | undefined): boolean {
  if (header == null) return false;
  const trimmed = header.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  const n = Number(trimmed);
  return !Number.isFinite(n) || n > DOC_REQUEST_MAX_BYTES;
}

function fieldLabel(key: string): string {
  const clean = key.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 80);
  return clean.length < key.length ? `${clean}…` : clean;
}

function coerceScalar(value: unknown): string | null {
  if (typeof value === "string") return value.trim();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

/**
 * Parse an already-read body. `contentLength` is optional so callers that
 * have not read the body yet can reject an oversized Content-Length first
 * (see `readDocRequest`).
 */
export function parseDocRequest(raw: string, contentLength?: string | null): DocParseResult {
  if (contentLengthExceeds(contentLength)) return payloadTooLarge();
  if (Buffer.byteLength(raw, "utf8") > DOC_REQUEST_MAX_BYTES) return payloadTooLarge();
  if (raw.trim() === "") return invalidJson();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return invalidJson();
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    Object.getPrototypeOf(parsed) !== Object.prototype
  ) {
    return fail(400, "invalid_body", "Request body must be a JSON object.");
  }

  const data: Record<string, string> = {};
  for (const key of Object.keys(parsed)) {
    if (RESERVED_KEYS.has(key)) {
      return fail(400, "invalid_body", "Request body contains a reserved field name.");
    }
    const value = (parsed as Record<string, unknown>)[key];
    const coerced = coerceScalar(value);
    if (coerced === null) {
      const nested = typeof value === "object" && value !== null;
      return fail(
        400,
        "invalid_body",
        nested
          ? `Field "${fieldLabel(key)}" must be a string, number, or boolean. Nested objects and arrays are not accepted.`
          : `Field "${fieldLabel(key)}" must be a string, number, or boolean.`
      );
    }
    if (coerced.length > DOC_REQUEST_MAX_FIELD_CHARS) {
      return fail(
        400,
        "field_too_long",
        `Field "${fieldLabel(key)}" exceeds ${DOC_REQUEST_MAX_FIELD_CHARS} characters.`
      );
    }
    Object.defineProperty(data, key, {
      value: coerced,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return { ok: true, data };
}

/**
 * Rate-limit first, then call this, then generate. Oversized Content-Length
 * is rejected before the body is read.
 */
export async function readDocRequest(req: DocRequestSource): Promise<DocParseResult> {
  const contentLength = req.headers.get("content-length");
  if (contentLengthExceeds(contentLength)) return payloadTooLarge();
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return invalidJson();
  }
  return parseDocRequest(raw);
}
