import type { NextRequest } from "next/server";
import { sbInsert, sbSelect } from "./supabase-server";

const MAX_REQUESTS_PER_HOUR = 10;

/**
 * On Vercel, x-real-ip carries the true client IP as determined by the edge.
 * As a fallback, use the LAST x-forwarded-for hop (appended by the trusted
 * proxy) - the first hop is client-supplied and trivially spoofable.
 */
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",");
    const last = hops[hops.length - 1]?.trim();
    if (last) return last;
  }
  return "unknown";
}

/**
 * Sliding-window rate limit backed by the generation_requests table: allow at
 * most 10 generations per IP per hour. Returns true when the request may
 * proceed (and records it). Fails OPEN on Supabase errors - a rate-limit
 * infra hiccup must never block paying users from generating documents.
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const rows = await sbSelect<{ id: string }>(
      "generation_requests",
      `ip=eq.${encodeURIComponent(ip)}&created_at=gte.${encodeURIComponent(since)}&select=id`
    );
    if (rows.length >= MAX_REQUESTS_PER_HOUR) {
      return false;
    }
    await sbInsert("generation_requests", { ip });
    return true;
  } catch (e) {
    console.error("[rate-limit] check failed - failing open:", e);
    return true;
  }
}
