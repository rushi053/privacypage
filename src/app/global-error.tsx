"use client";

import "./globals.css";
import { ErrorActions } from "./error-actions";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Replaces the root layout, so this document owns html and body.
  // Message, stack, and digest stay off the page — they can leak internals.
  void error;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Something went wrong</title>
      </head>
      <body
        className="antialiased bg-paper text-ink"
        style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}
      >
        <main className="min-h-screen bg-paper text-ink grid place-items-center px-6 py-16 md:px-8">
          <div className="w-full max-w-[440px]">
            <h1 className="font-display text-[32px] md:text-[40px] leading-[1.15] tracking-[-0.01em] mb-4">
              Something went wrong
            </h1>
            <p className="text-[16px] leading-[1.6] text-ink/80 mb-8">
              This page hit an unexpected error.
            </p>
            <ErrorActions reset={reset} />
          </div>
        </main>
      </body>
    </html>
  );
}
