"use client";

import "./globals.css";
import { Fraunces, Newsreader, Geist, Geist_Mono } from "next/font/google";
import { ErrorActions } from "./error-actions";

// global-error replaces the root layout, so it must load the same fonts the
// layout does (same options) or the h1 and body fall back to system fonts.
const fDisplay = Fraunces({ subsets: ["latin"], variable: "--f-display", display: "swap" });
const fDoc = Newsreader({ subsets: ["latin"], variable: "--f-doc", display: "swap" });
const fUi = Geist({ subsets: ["latin"], variable: "--f-ui", display: "swap" });
const fMono = Geist_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap" });

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
    <html lang="en" className={`${fDisplay.variable} ${fDoc.variable} ${fUi.variable} ${fMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Something went wrong</title>
      </head>
      <body className="antialiased bg-paper text-ink">
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
