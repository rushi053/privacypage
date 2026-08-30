"use client";

import { useState, useEffect, useRef } from "react";
import Wizard from "@/components/Wizard";
import PolicyPreview from "@/components/PolicyPreview";
import EmailCaptureModal from "@/components/EmailCaptureModal";
import { getWizardConfig, wizardConfigs } from "@/lib/wizardConfigs";
import { fetchGeoPricing, toSmallestUnit, type LocalPricing } from "@/lib/currency";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Logo } from "@/components/Logo";
import {
  BoltIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from "@/components/Icons";
import { FadeInView } from "@/components/FadeInView";
import { trackGenerateDocument, trackRestoreLicense } from "@/lib/analytics";

function getSavingsDisplay(pricing: LocalPricing | null): string {
  if (!pricing) return "save ₹2146";
  const savings = pricing.singlePrice * 5 - pricing.bundlePrice;
  const fmt = pricing.currency === "INR" ? Math.round(savings).toString() : savings.toFixed(2);
  return `save ${pricing.symbol}${fmt}`;
}

const faqItems = [
  {
    q: "Are these documents legally valid?",
    a: "Yes. Our templates follow current legal standards including GDPR, CCPA, CalOPPA, and COPPA. For highly regulated industries, we recommend an additional legal review.",
  },
  {
    q: "Can I edit the document after generating?",
    a: "Absolutely. You get the full document as HTML, Markdown, or plain text — edit it any way you need.",
  },
  {
    q: "What happens when laws change?",
    a: "Your license key gives you lifetime access. Come back and regenerate an updated document anytime — free, forever.",
  },
  {
    q: "What data do you store about me?",
    a: "Only your email address and license key for purchase verification. Your document inputs are processed in real-time and never stored on our servers.",
  },
  {
    q: "Can one purchase cover multiple apps?",
    a: "Each purchase covers one document set. The Bundle (all 5 docs) is the best value if you need full coverage for one app.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cards, UPI, netbanking, and wallets via Razorpay. All transactions are encrypted and secure.",
  },
];

const docTypeIcons: Record<string, React.ReactNode> = {
  privacy: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  tos: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  eula: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  cookie: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  disclaimer: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

export default function Home() {
  const [policy, setPolicy] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [totalLines, setTotalLines] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string> | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [pricing, setPricing] = useState<LocalPricing | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreInput, setRestoreInput] = useState("");
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [licenseModal, setLicenseModal] = useState<string | null>(null);
  const [emailCapture, setEmailCapture] = useState<"pro-single" | "bundle" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wizardRef = useRef<HTMLDivElement>(null);
  const { openPayment } = useRazorpay();

  useEffect(() => {
    let cancelled = false;
    fetchGeoPricing().then((p) => { if (!cancelled) setPricing(p); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (selectedDocType && wizardRef.current) {
      setTimeout(() => {
        wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedDocType]);

  const handleRestore = async () => {
    setRestoreLoading(true);
    setRestoreStatus(null);
    try {
      const isEmail = restoreInput.includes("@");
      const res = await fetch("/api/license/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEmail ? { email: restoreInput } : { licenseKey: restoreInput }),
      });
      const data = await res.json();
      if (data.found) {
        for (const p of data.purchases) {
          if (p.docType === "bundle") {
            localStorage.setItem("privacypage_bundle_unlocked", "true");
          } else if (p.docType === "pro-single") {
            // Legacy purchase type from before per-docType entitlements. This is
            // the one place the legacy flag is still written: restoring such a
            // purchase on a new device must grant the access it originally had.
            localStorage.setItem("privacypage_pro_single", "true");
          } else {
            localStorage.setItem(`privacypage_unlocked_${p.docType}`, "true");
          }
          localStorage.setItem("privacypage_license_key", p.licenseKey);
        }
        trackRestoreLicense();
        setRestoreStatus("Purchase restored. Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setRestoreStatus("No purchase found. Check your license key or email.");
      }
    } catch {
      setRestoreStatus("Something went wrong. Please try again.");
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleGenerate = async (data: Record<string, string>) => {
    setLoading(true);
    setFormData(data);
    const docType = data.docType || "privacy";
    const apiRoute = docType === "privacy" ? "/api/generate" : `/api/generate/${docType}`;
    try {
      const res = await fetch(apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        // 429 carries a friendly `message`; 503 (storage failure) carries `error`.
        const friendly =
          typeof json?.message === "string" ? json.message :
          typeof json?.error === "string" && json.error !== "rate_limited" ? json.error : "";
        throw new Error(friendly);
      }
      trackGenerateDocument(docType);
      if (json.documentId) {
        // New flow: full content stays server-side, client gets a preview.
        setDocumentId(json.documentId);
        setTotalLines(typeof json.totalLines === "number" ? json.totalLines : null);
        setPolicy(json.preview);
      } else {
        // legacyFull fallback: server couldn't store the document, full text returned.
        setDocumentId(null);
        setTotalLines(null);
        setPolicy(json.policy);
      }
    } catch (e) {
      setDocumentId(null);
      setTotalLines(null);
      setPolicy(
        e instanceof Error && e.message ? e.message : "Error generating document. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const startPayment = (docType: "pro-single" | "bundle", email: string) => {
    if (!pricing) return;
    const isBundle = docType === "bundle";
    openPayment({
      docType,
      currency: pricing.currency,
      amount: toSmallestUnit(isBundle ? pricing.bundlePrice : pricing.singlePrice, pricing.currency),
      description: isBundle ? "Bundle – All 5 Documents" : "Pro – Unlock Any Single Document",
      email,
      onSuccess: (licenseKey) => {
        // Pro-single is claimed on first use: the per-docType unlock flag is
        // written when this license first fetches a generated document
        // (PolicyPreview). The old global privacypage_pro_single flag stays
        // read-only/grandfathered in isDocUnlocked.
        if (licenseKey) setLicenseModal(licenseKey);
        else { alert(isBundle ? "Bundle unlocked!" : "Pro unlocked!"); window.location.reload(); }
      },
      onFailure: () => {},
    });
  };

  const handleReset = () => {
    setPolicy(null);
    setDocumentId(null);
    setTotalLines(null);
    setSelectedDocType(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="font-semibold text-gray-900">PrivacyPage</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">Features</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">Pricing</a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">FAQ</a>
            <a href="/blog" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">Blog</a>
            <div className="w-px h-4 bg-gray-200 mx-2" />
            <button onClick={() => setShowRestore(true)} className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">Restore</button>
            <a href="#generate" className="ml-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition-colors font-medium">Generate Free</a>
          </div>
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50">FAQ</a>
            <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50">Blog</a>
            <button onClick={() => { setShowRestore(true); setMobileMenuOpen(false); }} className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50">Restore Purchase</button>
            <a href="#generate" onClick={() => setMobileMenuOpen(false)} className="block text-sm bg-indigo-600 text-white px-3 py-2 rounded-lg text-center font-medium mt-2">Generate Free</a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 pb-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-6">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Free to try · No signup · One-time payment to unlock
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tight text-gray-900 leading-[1.1] mb-5">
            Legal docs for your app,<br />
            <span className="text-indigo-600">ready in 60 seconds.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Answer a few questions about your app. Get a complete, customized Privacy Policy, Terms of Service, EULA, and more — GDPR &amp; CCPA compliant, App Store ready.
          </p>

          {/* Compliance badges - inline, minimal */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { label: "GDPR" },
              { label: "CCPA" },
              { label: "App Store" },
              { label: "Play Store" },
              { label: "CalOPPA" },
            ].map((b) => (
              <span key={b.label} className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full font-medium">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {b.label}
              </span>
            ))}
          </div>

          {/* Scroll-to-generator arrow */}
          <a href="#generate" className="inline-flex flex-col items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors group">
            <span className="font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">Pick a document to get started ↓</span>
          </a>
        </div>
      </section>

      {/* ─── GENERATOR (above the fold on most screens) ─── */}
      <section id="generate" className="pb-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {!policy && !selectedDocType ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(wizardConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDocType(key)}
                    className="group text-left p-5 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/30 bg-white transition-all duration-150"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-100 transition-colors">
                        {docTypeIcons[key]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{config.displayName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{config.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Free preview</span>
                      <span className="text-xs font-medium text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Generate
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                All documents are free to preview. Pay {pricing?.singleDisplay || "₹849"} to unlock &amp; download.
              </p>
            </>
          ) : selectedDocType && !policy ? (
            <div ref={wizardRef}>
              <button onClick={() => setSelectedDocType(null)} className="mb-5 text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <Wizard config={getWizardConfig(selectedDocType)} onGenerate={handleGenerate} loading={loading} />
            </div>
          ) : (
            <PolicyPreview
              policy={policy!}
              formData={formData!}
              onReset={handleReset}
              docType={formData?.docType || "privacy"}
              documentId={documentId}
              totalLines={totalLines ?? undefined}
            />
          )}
        </div>
      </section>

      {/* ─── THIN DIVIDER WITH SOCIAL PROOF ─── */}
      <div className="border-y border-gray-100 bg-gray-50 py-5 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            GDPR &amp; CCPA compliant templates
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            App Store &amp; Play Store approved
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            One-time payment · No subscription
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Built by <a href="https://rushiraj.me" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Rushiraj</a>
          </span>
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Why PrivacyPage</h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Competitors charge monthly subscription fees. PrivacyPage is {pricing?.singleDisplay || "₹849"} once — no subscription, no renewal, ever.
              </p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                Icon: BoltIcon,
                title: "Done in 60 seconds",
                desc: "Answer questions about your app. Your doc is generated instantly — no account, no waiting, no back-and-forth.",
              },
              {
                Icon: ShieldCheckIcon,
                title: "Compliant by default",
                desc: "GDPR, CCPA, CalOPPA, COPPA, App Store guidelines. Every template is built around what regulators actually require.",
              },
              {
                Icon: DevicePhoneMobileIcon,
                title: "App Store ready",
                desc: "iOS and Android submission formats covered. Stop getting rejected for incomplete or missing legal pages.",
              },
              {
                Icon: BanknotesIcon,
                title: "Pay once, yours forever",
                desc: "No subscriptions. No seat limits. Pay once and the document is yours — including all future regenerations.",
              },
              {
                Icon: DocumentDuplicateIcon,
                title: "Copy it anywhere",
                desc: "HTML, Markdown, or plain text. Host on your site, a GitHub repo, Notion, Webflow — wherever you want.",
              },
              {
                Icon: ArrowPathIcon,
                title: "Free lifetime updates",
                desc: "Laws change. Your license key lets you regenerate an updated doc anytime at no extra cost.",
              },
            ].map((f, idx) => (
              <FadeInView key={f.title} delay={idx * 60}>
                <div className="p-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                    <f.Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Simple, honest pricing</h2>
              <p className="text-gray-500">Generate free. Pay once to unlock &amp; download — no subscriptions, ever.</p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Free */}
            <FadeInView delay={80}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Free</p>
                <div className="text-3xl font-bold text-gray-900 mb-1">{pricing?.symbol || "₹"}0</div>
                <p className="text-sm text-gray-400 mb-5">Always free to preview</p>
                <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                  {["Generate any document", "Full preview (first 25 lines)", "No account required"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#generate" className="block text-center w-full border border-gray-200 hover:border-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors text-gray-700">
                  Try it free
                </a>
              </div>
            </FadeInView>

            {/* Pro — highlighted */}
            <FadeInView delay={160}>
              <div className="bg-indigo-600 border border-indigo-600 rounded-2xl p-6 relative shadow-lg shadow-indigo-100">
                <div className="absolute -top-3 left-5 bg-white text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                  Most popular
                </div>
                <p className="text-sm font-medium text-indigo-200 mb-1">Pro</p>
                <div className="text-3xl font-bold text-white mb-1">{pricing?.singleDisplay || "₹849"}</div>
                <p className="text-sm text-indigo-300 mb-5">One time · Any single document</p>
                <ul className="space-y-2.5 text-sm text-indigo-100 mb-6">
                  {["Full document, no blur", "GDPR &amp; CCPA sections included", "HTML, Markdown &amp; plain text", "Lifetime regenerations"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      <span dangerouslySetInnerHTML={{ __html: f }} />
                    </li>
                  ))}
                </ul>
                <button
                  className="block w-full bg-white hover:bg-indigo-50 text-indigo-600 font-semibold py-2.5 rounded-xl text-sm transition-colors mb-3"
                  onClick={() => { if (pricing) setEmailCapture("pro-single"); }}
                >
                  Get Pro — {pricing?.singleDisplay || "₹849"}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-300">
                  <LockClosedIcon className="w-3 h-3" />
                  Secure · Razorpay
                </div>
              </div>
            </FadeInView>

            {/* Bundle */}
            <FadeInView delay={240}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 relative">
                <p className="text-sm font-medium text-gray-500 mb-1">Bundle</p>
                <div className="text-3xl font-bold text-gray-900 mb-1">{pricing?.bundleDisplay || "₹2099"}</div>
                <p className="text-sm text-gray-400 mb-5">One time · All 5 documents · {getSavingsDisplay(pricing)}</p>
                <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                  {["Privacy Policy", "Terms of Service", "EULA", "Cookie Policy", "Disclaimer"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mb-3"
                  onClick={() => { if (pricing) setEmailCapture("bundle"); }}
                >
                  Buy Bundle — {pricing?.bundleDisplay || "₹2099"}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <LockClosedIcon className="w-3 h-3" />
                  Secure · Razorpay
                </div>
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={300}>
            <p className="text-center text-xs text-gray-400 mt-6">
              All prices are one-time. No auto-renewals. Competitors charge monthly — you pay {pricing?.singleDisplay || "₹849"} once and own it forever.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <FadeInView>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">Common questions</h2>
          </FadeInView>
          <div className="space-y-2">
            {faqItems.map((item, i) => (
              <FadeInView key={i} delay={i * 40}>
                <div className={`border rounded-xl overflow-hidden transition-all ${openFaq === i ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-medium text-sm text-gray-900">{item.q}</span>
                    <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <FadeInView>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Your app is ready. Are your docs?</h2>
            <p className="text-gray-500 mb-8 text-sm">
              Takes 60 seconds. Free to preview. No account needed.
            </p>
            <a
              href="#generate"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg text-sm"
            >
              Generate your legal docs — free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </FadeInView>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Logo className="w-6 h-6" />
                <span className="font-semibold text-gray-900 text-sm">PrivacyPage</span>
              </div>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Privacy policies and legal docs for indie developers. Built by{" "}
                <a href="https://rushiraj.me" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Rushiraj</a>
                {" "}— made in India.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-2.5 text-xs uppercase tracking-wide">Product</p>
                <ul className="space-y-1.5 text-gray-500">
                  <li><a href="#generate" className="hover:text-gray-900 transition-colors">Generate</a></li>
                  <li><a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                  <li><a href="/blog" className="hover:text-gray-900 transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2.5 text-xs uppercase tracking-wide">Support</p>
                <ul className="space-y-1.5 text-gray-500">
                  <li><a href="mailto:rushirajjadeja@gmail.com?subject=PrivacyPage%20Support" className="hover:text-gray-900 transition-colors">Email</a></li>
                  <li><button onClick={() => setShowRestore(true)} className="hover:text-gray-900 transition-colors text-left">Restore</button></li>
                  <li><a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2.5 text-xs uppercase tracking-wide">More</p>
                <ul className="space-y-1.5 text-gray-500">
                  <li><a href="https://rushiraj.me" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Portfolio</a></li>
                  <li><a href="https://apps.apple.com/us/app/cashlens-personal-finance/id6743153951" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">CashLens</a></li>
                  <li><a href="https://x.com/cashLensApp" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">X / Twitter</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} PrivacyPage. All rights reserved.</p>
            <p>Indie-made with care in India 🇮🇳</p>
          </div>
        </div>
      </footer>

      {/* Restore Modal */}
      {showRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowRestore(false)}>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-1">Restore Purchase</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your license key or purchase email.</p>
            <input
              type="text"
              value={restoreInput}
              onChange={(e) => setRestoreInput(e.target.value)}
              placeholder="PP-XXXXXXXX or email address"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 mb-3"
            />
            {restoreStatus && (
              <p className={`text-sm mb-3 ${restoreStatus.includes("restored") ? "text-green-600" : "text-red-600"}`}>
                {restoreStatus}
              </p>
            )}
            <div className="flex gap-2.5">
              <button
                onClick={handleRestore}
                disabled={!restoreInput.trim() || restoreLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {restoreLoading ? "Checking..." : "Restore"}
              </button>
              <button onClick={() => setShowRestore(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Capture Modal (before checkout) */}
      {emailCapture && (
        <EmailCaptureModal
          description={emailCapture === "bundle" ? "Bundle – All 5 Documents" : "Pro – Unlock Any Single Document"}
          onSubmit={(email) => {
            const docType = emailCapture;
            setEmailCapture(null);
            startPayment(docType, email);
          }}
          onClose={() => setEmailCapture(null)}
        />
      )}

      {/* License Key Modal */}
      {licenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full mx-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Payment successful</h3>
            <p className="text-sm text-gray-500 mb-4">Save your license key — you&apos;ll need it to restore on other devices.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 font-mono text-base tracking-wider text-indigo-600 select-all">
              {licenseModal}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(licenseModal)}
              className="w-full border border-gray-200 hover:border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors mb-2"
            >
              Copy key
            </button>
            <button
              onClick={() => { setLicenseModal(null); window.location.reload(); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Continue
            </button>
            <p className="text-xs text-gray-400 mt-3">We&apos;ll also email this to you for safekeeping.</p>
          </div>
        </div>
      )}
    </div>
  );
}
