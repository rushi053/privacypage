"use client";

// PREVIEW-ONLY TEST HOOK — remove before merge if not wanted.
// Rendered by the root layout only when VERCEL_ENV !== "production". Any URL
// with ?__throw=global throws inside the root layout so global-error.tsx shows.
import { useEffect, useState } from "react";

export function PreviewGlobalThrow() {
  const [shouldThrow, setShouldThrow] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("__throw") === "global") {
      setShouldThrow(true);
    }
  }, []);
  if (shouldThrow) throw new Error("preview-global-throw: intentional test throw");
  return null;
}
