// GA4 event helpers. gtag is loaded via the inline script in layout.tsx;
// every helper no-ops when it's absent (SSR, ad blockers, script not loaded).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtagEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export function trackGenerateDocument(docType: string): void {
  gtagEvent("generate_document", { doc_type: docType });
}

/** value is in major currency units (e.g. 9.99, 849). */
export function trackBeginCheckout(docType: string, value: number, currency: string): void {
  gtagEvent("begin_checkout", { doc_type: docType, value, currency });
}

export function trackPurchase(orderId: string, value: number, currency: string, docType: string): void {
  gtagEvent("purchase", { transaction_id: orderId, value, currency, doc_type: docType });
}

export function trackRestoreLicense(): void {
  gtagEvent("restore_license");
}
