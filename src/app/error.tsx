"use client";

import { ErrorActions } from "./error-actions";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Accepted so Next can pass the boundary error through. Message, stack,
  // and digest stay off the page — they can leak internals.
  void error;

  return (
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
  );
}
