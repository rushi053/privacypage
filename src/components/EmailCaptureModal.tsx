"use client";

import { useState } from "react";
import { LockIcon } from "@/components/ClauseIcons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailCaptureModalProps {
  /** Shown under the heading, e.g. what's being purchased. */
  description?: string;
  onSubmit: (email: string) => void;
  onClose: () => void;
}

/** Collects the buyer's email before opening Razorpay checkout, so the
 * license key can be emailed and the purchase restored later. */
export default function EmailCaptureModal({ description, onSubmit, onClose }: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="email-capture-title">
      <div className="bg-white border border-ink/10 rounded-[8px] p-6 md:p-8 max-w-[400px] w-full shadow-[0_24px_48px_-16px_rgba(22,24,29,0.25)]" onClick={(e) => e.stopPropagation()}>
        <p className="font-mono text-[12px] text-seal mb-2">Checkout · step 1 of 2</p>
        <h3 id="email-capture-title" className="font-display text-[24px] leading-[1.25] mb-2">Where should we send your license?</h3>
        <p className="text-[14px] leading-[1.5] text-ink/70 mb-6">
          {description || "We'll email your license key so you can restore your purchase anytime."}
        </p>
        <label htmlFor="checkout-email" className="block text-[12px] uppercase tracking-[0.08em] text-ink/60 mb-2">Email</label>
        <input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleContinue(); }}
          placeholder="you@example.com"
          autoFocus
          className="w-full h-12 border border-ink/15 rounded-[8px] px-4 text-[16px] text-ink placeholder-ink/40 bg-white focus:outline-none focus:border-seal mb-2"
        />
        <p className={`text-[14px] min-h-6 mb-4 ${error ? "text-red-700" : "text-ink/50"}`}>{error || "Used only for your license and receipt."}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleContinue}
            disabled={!email.trim()}
            className="flex-1 h-12 bg-seal hover:bg-seal-dark disabled:opacity-40 text-white rounded-[8px] text-[16px] font-medium transition-colors"
          >
            Continue to payment
          </button>
          <button onClick={onClose} className="h-12 px-6 border border-ink/15 rounded-[8px] text-[16px] text-ink/70 hover:text-ink hover:border-ink/30 transition-colors">
            Cancel
          </button>
        </div>
        <p className="mt-4 flex items-center gap-2 text-[12px] text-ink/50"><LockIcon className="w-4 h-4" /> Payment is handled by Razorpay in the next step.</p>
      </div>
    </div>
  );
}
