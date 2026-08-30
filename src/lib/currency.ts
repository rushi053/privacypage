export interface LocalPricing {
  currency: string;
  symbol: string;
  singlePrice: number;
  bundlePrice: number;
  singleDisplay: string;
  bundleDisplay: string;
}

const PRICING: Record<string, { symbol: string; single: number; bundle: number; decimals: boolean }> = {
  INR: { symbol: "₹", single: 849, bundle: 2099, decimals: false },
  USD: { symbol: "$", single: 9.99, bundle: 24.99, decimals: true },
};

// Amount in smallest unit (paise/cents)
export function toSmallestUnit(amount: number, currency: string): number {
  if (currency === "INR") return amount * 100;
  return Math.round(amount * 100);
}

/**
 * INR for India, USD everywhere else. Unknown country (no geo header, e.g.
 * localhost) defaults to INR - the safest currency for a Razorpay account.
 */
export function getPricingForCountry(country?: string | null): LocalPricing {
  const currency = country && country !== "IN" ? "USD" : "INR";
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

/** Client-side: resolve pricing from the server's geo lookup (/api/geo). */
export async function fetchGeoPricing(): Promise<LocalPricing> {
  let country: string | null = null;
  try {
    const res = await fetch("/api/geo");
    const json = await res.json();
    country = typeof json.country === "string" ? json.country : null;
  } catch {
    // no geo -> INR default
  }
  return getPricingForCountry(country);
}
