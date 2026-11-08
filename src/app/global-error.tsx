"use client";

import "./globals.css";

const paper = "#F7F7F5";
const ink = "#16181D";
const seal = "#0F5C63";
const sealDark = "#0B4A50";

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
        <title>Something went wrong</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: paper,
          color: ink,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main
          className="min-h-screen bg-paper text-ink grid place-items-center"
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "64px 24px",
            background: paper,
            color: ink,
          }}
        >
          <div style={{ width: "100%", maxWidth: 440 }}>
            <h1
              className="font-display text-[32px] leading-[1.15] tracking-[-0.01em]"
              style={{
                fontSize: 32,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                fontWeight: 500,
                margin: "0 0 16px",
              }}
            >
              Something went wrong
            </h1>
            <p
              className="text-[16px] leading-[1.6]"
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                margin: "0 0 32px",
              }}
            >
              This page hit an unexpected error.
            </p>
            <div
              className="flex flex-wrap items-center gap-4"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 16,
              }}
            >
              <button
                type="button"
                onClick={() => reset()}
                className="h-12 inline-flex items-center px-6 bg-seal text-white rounded-[8px] text-[16px] font-medium"
                style={{
                  height: 48,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 24px",
                  background: seal,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = sealDark;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = seal;
                }}
                onFocus={(event) => {
                  event.currentTarget.style.background = sealDark;
                }}
                onBlur={(event) => {
                  event.currentTarget.style.background = seal;
                }}
              >
                Try again
              </button>
              <a
                href="/"
                className="h-12 inline-flex items-center text-[16px] underline underline-offset-4"
                style={{
                  height: 48,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 8px",
                  color: seal,
                  fontSize: 16,
                  textDecoration: "underline",
                  textUnderlineOffset: 4,
                }}
              >
                Home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
