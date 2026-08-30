// Server-only Supabase REST helpers (no SDK). Uses the service-role key so it
// works against RLS-locked tables; API routes are the only consumers.

function getConfig(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error("SUPABASE_URL is not set");
  }
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY is not set - falling back to SUPABASE_ANON_KEY. " +
        "RLS-locked tables (documents, purchases) will NOT be accessible with the anon key. " +
        "Set SUPABASE_SERVICE_ROLE_KEY in the environment."
    );
    key = process.env.SUPABASE_ANON_KEY;
  }
  if (!key) {
    throw new Error("Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set");
  }
  return { url, key };
}

async function sbFetch<T>(path: string, init: RequestInit): Promise<T> {
  const { url, key } = getConfig();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "<unreadable body>");
    console.error(`Supabase request failed: ${init.method || "GET"} /${path} -> ${res.status}: ${body}`);
    throw new Error(`Supabase request failed with status ${res.status}`);
  }
  // 204 No Content (e.g. inserts without return=representation)
  if (res.status === 204) return [] as unknown as T;
  return (await res.json()) as T;
}

/** Insert a row and return the inserted row(s). */
export async function sbInsert<T = Record<string, unknown>>(
  table: string,
  row: Record<string, unknown>
): Promise<T[]> {
  return sbFetch<T[]>(table, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
}

/** Select rows. queryParams is a PostgREST query string, e.g. "license_key=eq.PP-XXXX&select=doc_type". */
export async function sbSelect<T = Record<string, unknown>>(
  table: string,
  queryParams: string
): Promise<T[]> {
  return sbFetch<T[]>(`${table}?${queryParams}`, { method: "GET" });
}

/** Update rows matched by queryParams; returns the updated row(s). */
export async function sbUpdate<T = Record<string, unknown>>(
  table: string,
  queryParams: string,
  patch: Record<string, unknown>
): Promise<T[]> {
  return sbFetch<T[]>(`${table}?${queryParams}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
}
