"use client";

import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface PaymentOptions {
  docType: string;
  currency: string;
  amount: number;
  description?: string;
  onSuccess: (licenseKey?: string) => void;
  onFailure: (error: string) => void;
}

export function useRazorpay() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || document.querySelector('script[src*="checkout.razorpay.com"]')) {
      scriptLoaded.current = true;
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { scriptLoaded.current = true; };
    document.body.appendChild(script);
  }, []);

  const openPayment = useCallback(async ({ docType, currency, amount, description, onSuccess, onFailure }: PaymentOptions) => {
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, currency, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      if (!window.Razorpay) {
        onFailure("Payment system not loaded. Please refresh and try again.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "PrivacyPage",
        description: description || (docType === "bundle" ? "Bundle - All 5 Documents" : `Unlock ${docType} - Full Document`),
        order_id: data.orderId,
        prefill: { email: "" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            // Extract email from Razorpay's internal state (it's stored in the checkout)
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                docType,
                amount: data.amount,
                currency: data.currency,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              if (docType === "bundle") {
                localStorage.setItem("privacypage_bundle_unlocked", "true");
              } else {
                localStorage.setItem(`privacypage_unlocked_${docType}`, "true");
              }
              if (verifyData.licenseKey) {
                localStorage.setItem("privacypage_license_key", verifyData.licenseKey);
              }
              onSuccess(verifyData.licenseKey);
            } else {
              onFailure("Payment verification failed");
            }
          } catch {
            onFailure("Payment verification error");
          }
        },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => onFailure("Payment cancelled") },
        method: { card: true, upi: true, netbanking: true, wallet: true },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      onFailure(error instanceof Error ? error.message : "Payment failed");
    }
  }, []);

  return { openPayment };
}

export function isDocUnlocked(docType: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("privacypage_bundle_unlocked") === "true" ||
    localStorage.getItem("privacypage_pro_single") === "true" ||
    localStorage.getItem(`privacypage_unlocked_${docType}`) === "true";
}
