export interface LocalPricing {
  currency: string;
  symbol: string;
  singlePrice: number;
  bundlePrice: number;
  singleDisplay: string;
  bundleDisplay: string;
}

const PRICING: Record<string, { symbol: string; single: number; bundle: number; decimals: boolean }> = {
  INR: { symbol: "₹", single: 10, bundle: 20, decimals: false },
  USD: { symbol: "$", single: 9.99, bundle: 24.99, decimals: true },
  EUR: { symbol: "€", single: 9.49, bundle: 23.49, decimals: true },
  GBP: { symbol: "£", single: 7.99, bundle: 19.99, decimals: true },
};

// Amount in smallest unit (paise/cents)
export function toSmallestUnit(amount: number, currency: string): number {
  if (currency === "INR") return amount * 100;
  return Math.round(amount * 100);
}

function detectCurrency(): string {
  if (typeof window === "undefined") return "USD";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang = navigator.language || "";

    if (tz.startsWith("Asia/Calcutta") || tz.startsWith("Asia/Kolkata") || lang.startsWith("hi") || lang === "en-IN") return "INR";
    if (tz.startsWith("Europe/London") || lang === "en-GB") return "GBP";
    if (tz.startsWith("America/") || lang === "en-US") return "USD";

    const euTimezones = ["Europe/Berlin", "Europe/Paris", "Europe/Rome", "Europe/Madrid", "Europe/Amsterdam", "Europe/Brussels", "Europe/Vienna", "Europe/Dublin", "Europe/Lisbon", "Europe/Helsinki", "Europe/Athens", "Europe/Warsaw", "Europe/Prague", "Europe/Budapest", "Europe/Bucharest", "Europe/Stockholm", "Europe/Oslo", "Europe/Copenhagen"];
    if (euTimezones.some((t) => tz.startsWith(t)) || ["de", "fr", "it", "es", "nl", "pt"].some((l) => lang.startsWith(l))) return "EUR";
  } catch {}
  return "USD";
}

export function getLocalPricing(): LocalPricing {
  const currency = detectCurrency();
  const p = PRICING[currency] || PRICING.USD;
  const fmt = (v: number) => p.decimals ? v.toFixed(2) : v.toString();
  return {
    currency,
    symbol: p.symbol,
    singlePrice: p.single,
    bundlePrice: p.bundle,
    singleDisplay: `${p.symbol}${fmt(p.single)}`,
    bundleDisplay: `${p.symbol}${fmt(p.bundle)}`,
  };
}
