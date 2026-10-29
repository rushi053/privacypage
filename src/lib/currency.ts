/**
 * SINGLE SOURCE OF TRUTH for prices. Both the displayed price (/api/geo ->
 * fetchGeoPricing) and the charged amount (/api/payment/create-order) are
 * derived from PRICING below, and the currency is always chosen SERVER-SIDE
 * from Vercel's `x-vercel-ip-country` header. The client never decides the
 * currency or the amount, so display and charge cannot diverge.
 */
export interface LocalPricing {
  currency: "INR" | "USD";
  symbol: string;
  singlePrice: number;
  bundlePrice: number;
  singleDisplay: string;
  bundleDisplay: string;
}

export const PRICING = {
  INR: { symbol: "₹", single: 849, bundle: 2099, decimals: false },
  USD: { symbol: "$", single: 9.99, bundle: 24.99, decimals: true },
} as const;

export type Currency = keyof typeof PRICING;

/** Amount in smallest unit (paise/cents). */
export function toSmallestUnit(amount: number, _currency?: string): number {
  return Math.round(amount * 100);
}

/** INR for India, USD everywhere else. No header (localhost) -> INR. */
export function currencyForCountry(country?: string | null): Currency {
  return country && country.toUpperCase() !== "IN" ? "USD" : "INR";
}

export function getPricingForCountry(country?: string | null): LocalPricing {
  const currency = currencyForCountry(country);
  const p = PRICING[currency];
  const fmt = (v: number) => (p.decimals ? v.toFixed(2) : v.toString());
  return {
    currency,
    symbol: p.symbol,
    singlePrice: p.single,
    bundlePrice: p.bundle,
    singleDisplay: `${p.symbol}${fmt(p.single)}`,
    bundleDisplay: `${p.symbol}${fmt(p.bundle)}`,
  };
}

/** Server-side: country from Vercel's edge geo header. */
export function countryFromHeaders(h: Headers): string | null {
  return h.get("x-vercel-ip-country") || null;
}

/** Server-side: the exact order the server will charge. */
export function getChargeForRequest(h: Headers, docType: string) {
  const pricing = getPricingForCountry(countryFromHeaders(h));
  const major = docType === "bundle" ? pricing.bundlePrice : pricing.singlePrice;
  return { currency: pricing.currency, amount: toSmallestUnit(major), pricing };
}

/** Client-side: pricing as computed by the server (/api/geo). */
export async function fetchGeoPricing(): Promise<LocalPricing> {
  try {
    const res = await fetch("/api/geo", { cache: "no-store" });
    const json = await res.json();
    if (json && json.pricing && typeof json.pricing.singleDisplay === "string") {
      return json.pricing as LocalPricing;
    }
  } catch {
    // fall through
  }
  return getPricingForCountry(null);
}

/**
 * Canonical display strings for static/SEO copy, derived from PRICING (USD is
 * the default for crawlers and non-India visitors). <PriceLocalizer/> swaps
 * these to the visitor's server-computed currency on the client.
 */
const usd = getPricingForCountry("US");
const inr = getPricingForCountry("IN");
export const PRICE = {
  single: usd.singleDisplay,
  bundle: usd.bundleDisplay,
  singleInr: inr.singleDisplay,
  bundleInr: inr.bundleDisplay,
} as const;
