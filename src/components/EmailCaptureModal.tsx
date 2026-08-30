"use client";

import { useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 mb-1">Where should we send your license?</h3>
        <p className="text-sm text-gray-500 mb-4">
          {description || "We'll email your license key so you can restore your purchase anytime."}
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleContinue(); }}
          placeholder="you@example.com"
          autoFocus
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 mb-3"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2.5">
          <button
            onClick={handleContinue}
            disabled={!email.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Continue to payment
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
