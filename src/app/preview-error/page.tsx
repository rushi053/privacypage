// PREVIEW-ONLY TEST HOOK — remove before merge if not wanted.
// /preview-error throws during render so src/app/error.tsx can be checked on a
// Vercel preview. In production (VERCEL_ENV === "production") it is a 404.
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default function PreviewError() {
  if (process.env.VERCEL_ENV === "production") notFound();
  throw new Error("preview-error: intentional test throw");
}
