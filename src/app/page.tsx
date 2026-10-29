"use client";

import { useState, useEffect, useRef } from "react";
import Wizard from "@/components/Wizard";
import PolicyPreview from "@/components/PolicyPreview";
import EmailCaptureModal from "@/components/EmailCaptureModal";
import { getWizardConfig, wizardConfigs } from "@/lib/wizardConfigs";
import { fetchGeoPricing, toSmallestUnit, type LocalPricing } from "@/lib/currency";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Logo } from "@/components/Logo";
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon, LockIcon, MenuIcon, CloseIcon, ChevronDownIcon, DocIcon, ShieldIcon, CookieIcon, AlertIcon, KeyIcon } from "@/components/ClauseIcons";
import { trackGenerateDocument, trackRestoreLicense } from "@/lib/analytics";

function getSavingsDisplay(pricing: LocalPricing | null): string {
  if (!pricing) return "save …";
  const savings = pricing.singlePrice * 5 - pricing.bundlePrice;
  const fmt = pricing.currency === "INR" ? Math.round(savings).toString() : savings.toFixed(2);
  return `save ${pricing.symbol}${fmt}`;
}

const faqItems = [
  {
    q: "Are these documents legally valid?",
    a: "They are written to cover what GDPR, CCPA, CalOPPA and COPPA ask a policy to disclose, based on your answers. They are not legal advice; for regulated industries such as health, finance or children\u2019s apps, have a lawyer review the result.",
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
  privacy: <ShieldIcon className="w-5 h-5" />,
  tos: <DocIcon className="w-5 h-5" />,
  eula: <KeyIcon className="w-5 h-5" />,
  cookie: <CookieIcon className="w-5 h-5" />,
  disclaimer: <AlertIcon className="w-5 h-5" />,
};

const SAMPLE = [
  { n: "1", h: "Information we collect", t: "When you create an account we collect your email address. When the app crashes we receive a crash trace and an installation identifier so we can fix the bug." },
  { n: "2", h: "How we use it", t: "We use this information to provide and secure the service. We do not sell personal information." },
  { n: "3", h: "Your rights", t: "You can ask us to access, correct, or delete your data at any time by emailing privacy@yourapp.com." },
];

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

  const navLinks = [
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "/blog", label: "Guides" },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink font-ui">
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
      <nav className="sticky top-0 w-full z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="max-w-[1120px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-display text-[20px] tracking-[-0.01em]">PrivacyPage</span>
          </a>
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="h-10 inline-flex items-center px-4 text-[14px] text-ink/70 hover:text-ink rounded-[8px] transition-colors">{l.label}</a>
            ))}
            <button onClick={() => setShowRestore(true)} className="h-10 px-4 text-[14px] text-ink/70 hover:text-ink rounded-[8px] transition-colors">Restore purchase</button>
            <a href="#generate" className="ml-2 h-10 inline-flex items-center px-4 text-[14px] bg-seal hover:bg-seal-dark text-white rounded-[8px] font-medium transition-colors">Generate free</a>
          </div>
          <button aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} className="md:hidden w-12 h-12 -mr-2 flex items-center justify-center text-ink/70" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-ink/10 bg-paper px-6 py-4 grid gap-1">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className="h-12 flex items-center text-[16px] text-ink/80">{l.label}</a>
            ))}
            <button onClick={() => { setShowRestore(true); setMobileMenuOpen(false); }} className="h-12 text-left text-[16px] text-ink/80">Restore purchase</button>
            <a href="#generate" onClick={() => setMobileMenuOpen(false)} className="h-12 mt-2 flex items-center justify-center bg-seal text-white rounded-[8px] text-[16px] font-medium">Generate free</a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="px-6 md:px-8 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[1fr_480px] gap-16 items-center">
          <div>
            <p className="font-mono text-[12px] text-seal mb-6">Privacy policy · Terms · EULA · Cookie policy · Disclaimer</p>
            <h1 className="font-display text-[40px] sm:text-[48px] md:text-[64px] leading-[1.05] tracking-[-0.02em] mb-6">
              Legal documents for your app, written from your answers.
            </h1>
            <p className="font-doc text-[20px] leading-[1.6] text-ink/80 max-w-[560px] mb-8">
              Answer about ten plain questions about what your app collects. Read the draft free. Pay once only if you want to keep it.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#generate" className="h-12 inline-flex items-center gap-2 px-6 bg-seal hover:bg-seal-dark text-white rounded-[8px] text-[16px] font-medium transition-colors">
                Generate free <ArrowRightIcon />
              </a>
              <a href="#pricing" className="h-12 inline-flex items-center px-4 text-[16px] text-ink/70 hover:text-ink underline underline-offset-4 decoration-ink/20">
                {pricing ? `${pricing.singleDisplay} once to unlock` : "See pricing"}
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink/60">
              {["No account needed", "No subscription", "GDPR & CCPA sections"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-seal" />{t}</li>
              ))}
            </ul>
          </div>

          {/* Sample excerpt */}
          <figure className="relative rounded-[8px] border border-ink/10 bg-white shadow-[0_24px_48px_-24px_rgba(22,24,29,0.2)]">
            <div aria-hidden className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(50%_50%_at_50%_40%,rgba(15,92,99,0.10),transparent_70%)]" />
            <div className="flex items-center justify-between px-6 h-12 border-b border-ink/10">
              <span className="font-mono text-[12px] text-ink/50">privacy-policy.md</span>
              <span className="text-[12px] uppercase tracking-[0.08em] text-ink/40">Sample excerpt</span>
            </div>
            <div className="doc-ruled px-6 md:px-8 py-8 font-doc text-[16px] leading-[1.6] text-ink/85">
              <p className="font-display text-[24px] leading-[1.2] mb-6 text-ink">Privacy Policy</p>
              {SAMPLE.map((c) => (
                <div key={c.n} className="grid grid-cols-[40px_1fr] mb-6 last:mb-0">
                  <span className="font-mono text-[13px] leading-[1.9] text-seal">§ {c.n}</span>
                  <div>
                    <p className="font-display text-[17px] text-ink mb-1">{c.h}</p>
                    <p>{c.t}</p>
                  </div>
                </div>
              ))}
            </div>
            <figcaption className="px-6 py-4 border-t border-ink/10 text-[12px] text-ink/50">Illustrative. Your document is generated from your own answers.</figcaption>
          </figure>
        </div>
      </section>

      {/* ─── GENERATOR ─── */}
      <section id="generate" className="px-6 md:px-8 py-16 md:py-24 border-t border-ink/10 bg-[#FBFBFA] scroll-mt-16">
        <div className="max-w-[1120px] mx-auto">
          {!policy && !selectedDocType ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <p className="font-mono text-[12px] text-seal mb-2">Step 1</p>
                  <h2 className="font-display text-[32px] md:text-[40px] leading-[1.15] tracking-[-0.01em]">Pick a document</h2>
                </div>
                <p className="text-[14px] text-ink/60 max-w-[360px]">All five are free to preview. Unlocking one costs {pricing?.singleDisplay ?? "…"}, once.</p>
              </div>
              <ul className="rounded-[8px] border border-ink/10 bg-white divide-y divide-ink/10">
                {Object.entries(wizardConfigs).map(([key, config], i) => (
                  <li key={key}>
                    <button
                      onClick={() => setSelectedDocType(key)}
                      className="group w-full text-left grid grid-cols-[32px_1fr_auto] md:grid-cols-[48px_40px_1fr_auto] items-center gap-4 px-4 md:px-6 min-h-[72px] py-4 hover:bg-seal-tint/50 transition-colors"
                    >
                      <span className="hidden md:block font-mono text-[13px] text-ink/40">0{i + 1}</span>
                      <span className="text-seal">{docTypeIcons[key]}</span>
                      <span>
                        <span className="block font-display text-[18px] md:text-[20px] leading-[1.3]">{config.displayName}</span>
                        <span className="block text-[14px] text-ink/60 leading-[1.5]">{config.description}</span>
                      </span>
                      <span className="inline-flex items-center gap-2 text-[14px] font-medium text-seal">
                        <span className="hidden sm:inline">Start</span> <ArrowRightIcon />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : selectedDocType && !policy ? (
            <div ref={wizardRef} className="scroll-mt-24">
              <button onClick={() => setSelectedDocType(null)} className="mb-6 h-10 inline-flex items-center gap-2 text-[14px] text-ink/60 hover:text-ink transition-colors">
                <ArrowLeftIcon /> All documents
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

      {/* ─── HOW IT WORKS (numbered clauses) ─── */}
      <section id="how" className="px-6 md:px-8 py-16 md:py-24 border-t border-ink/10">
        <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-16">
          <div>
            <p className="font-mono text-[12px] text-seal mb-2">How it works</p>
            <h2 className="font-display text-[32px] md:text-[40px] leading-[1.15] tracking-[-0.01em]">Terms of this service, in plain words</h2>
          </div>
          <ol className="divide-y divide-ink/10 border-y border-ink/10">
            {[
              { t: "You answer, we draft.", d: "About ten questions on what your app collects: accounts, payments, analytics, crash reports, AI calls. The draft is written from those answers, not a generic template." },
              { t: "Read it before you pay.", d: "The first part of every document is free to read in full. Nothing is hidden behind an account." },
              { t: "Pay once, keep it.", d: `${pricing?.singleDisplay ?? "…"} unlocks one document; ${pricing?.bundleDisplay ?? "…"} unlocks all five. No subscription, no renewal.` },
              { t: "Export anywhere.", d: "Copy as text, or download HTML or Markdown. Host it on your site, GitHub, or Notion and paste the URL into App Store Connect or Play Console." },
              { t: "Regenerate when things change.", d: "Your license key lets you regenerate an updated document later at no extra cost." },
            ].map((c, i) => (
              <li key={c.t} className="grid grid-cols-[48px_1fr] md:grid-cols-[64px_1fr] gap-4 py-6 md:py-8">
                <span className="font-mono text-[14px] leading-[2] text-seal">§ {i + 1}</span>
                <div>
                  <p className="font-display text-[20px] md:text-[22px] leading-[1.35] mb-2">{c.t}</p>
                  <p className="font-doc text-[17px] leading-[1.6] text-ink/75">{c.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="px-6 md:px-8 py-16 md:py-24 border-t border-ink/10 bg-[#FBFBFA] scroll-mt-16">
        <div className="max-w-[880px] mx-auto">
          <div className="mb-8 md:mb-12">
            <p className="font-mono text-[12px] text-seal mb-2">Pricing</p>
            <h2 className="font-display text-[32px] md:text-[40px] leading-[1.15] tracking-[-0.01em] mb-4">Preview free. Pay once to unlock.</h2>
            <p className="font-doc text-[18px] leading-[1.6] text-ink/70 max-w-[600px]">Most policy tools bill monthly for a document you write once. Here you pay one time, in your currency, and the file is yours.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {[
              {
                key: "pro-single" as const,
                name: "Single document",
                price: pricing?.singleDisplay,
                sub: "One time · any one document",
                items: ["The complete document", "HTML, Markdown and plain text", "Free regenerations", "License key by email"],
                cta: "Unlock one document",
                primary: true,
              },
              {
                key: "bundle" as const,
                name: "All five documents",
                price: pricing?.bundleDisplay,
                sub: `One time · ${getSavingsDisplay(pricing)} vs buying separately`,
                items: ["Privacy Policy", "Terms of Service", "EULA", "Cookie Policy", "Disclaimer"],
                cta: "Unlock all five",
                primary: false,
              },
            ].map((plan) => (
              <div key={plan.key} className="rounded-[8px] border border-ink/10 bg-white p-6 md:p-8 flex flex-col">
                <p className="text-[12px] uppercase tracking-[0.08em] text-ink/60 mb-4">{plan.name}</p>
                <p className="font-display text-[48px] leading-none tracking-[-0.02em] mb-2" data-testid={`price-${plan.key}`}>{plan.price ?? "…"}</p>
                <p className="text-[14px] text-ink/60 mb-6">{plan.sub}</p>
                <ul className="space-y-2 mb-8 text-[15px] text-ink/80">
                  {plan.items.map((f) => (
                    <li key={f} className="flex items-start gap-2"><CheckIcon className="w-4 h-4 mt-1 text-seal shrink-0" />{f}</li>
                  ))}
                </ul>
                <button
                  className={`mt-auto h-12 rounded-[8px] text-[16px] font-medium transition-colors ${plan.primary ? "bg-seal hover:bg-seal-dark text-white" : "border border-ink/20 hover:border-ink/40 text-ink bg-white"}`}
                  onClick={() => { if (pricing) setEmailCapture(plan.key); }}
                  disabled={!pricing}
                >
                  {plan.cta}{plan.price ? ` · ${plan.price}` : ""}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-2 text-[14px] text-ink/60">
            <LockIcon className="w-4 h-4" /> Cards, UPI, netbanking and wallets via Razorpay. Previewing any document is always free.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="px-6 md:px-8 py-16 md:py-24 border-t border-ink/10 scroll-mt-16">
        <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-16">
          <div>
            <p className="font-mono text-[12px] text-seal mb-2">Questions</p>
            <h2 className="font-display text-[32px] md:text-[40px] leading-[1.15] tracking-[-0.01em]">Before you buy</h2>
          </div>
          <div className="border-t border-ink/10">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b border-ink/10">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full min-h-16 py-4 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-display text-[18px] md:text-[20px] leading-[1.35]">{item.q}</span>
                  <ChevronDownIcon className={`w-5 h-5 text-ink/40 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <p className="pb-6 font-doc text-[17px] leading-[1.6] text-ink/75 max-w-[640px]">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="px-6 md:px-8 py-16 md:py-24 border-t border-ink/10 bg-[#FBFBFA]">
        <div className="max-w-[880px] mx-auto text-center">
          <h2 className="font-display text-[32px] md:text-[40px] leading-[1.15] tracking-[-0.01em] mb-4">Your app is ready. Are its documents?</h2>
          <p className="font-doc text-[18px] text-ink/70 mb-8">Free to preview. No account needed.</p>
          <a href="#generate" className="h-12 inline-flex items-center gap-2 px-6 bg-seal hover:bg-seal-dark text-white rounded-[8px] text-[16px] font-medium transition-colors">
            Generate free <ArrowRightIcon />
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-ink/10 px-6 md:px-8 py-16">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Logo className="w-6 h-6" />
                <span className="font-display text-[18px]">PrivacyPage</span>
              </div>
              <p className="text-[14px] text-ink/60 max-w-[320px] leading-[1.5]">
                Privacy policies and legal documents for indie developers. Built by{" "}
                <a href="https://rushiraj.me" target="_blank" rel="noopener noreferrer" className="text-seal underline underline-offset-4 decoration-seal/30">Rushiraj</a> in India. Not legal advice.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 text-[14px]">
              {[
                { h: "Product", l: [["#generate", "Generate"], ["#pricing", "Pricing"], ["/blog", "Guides"]] },
                { h: "Platforms", l: [["/for/ios-app", "iOS apps"], ["/for/android-app", "Android apps"], ["/for/chrome-extension", "Chrome extensions"], ["/for/discord-bot", "Discord bots"]] },
                { h: "Compare", l: [["/vs/termly", "vs Termly"], ["/compliance/gdpr", "GDPR guide"], ["/compliance/dpdp", "DPDP Act (India)"]] },
                { h: "Support", l: [["mailto:rushirajjadeja@gmail.com?subject=PrivacyPage%20Support", "Email"], ["#faq", "FAQ"]] },
                { h: "More", l: [["https://rushiraj.me", "Portfolio"], ["https://apps.apple.com/us/app/cashlens-personal-finance/id6743153951", "CashLens"], ["https://x.com/cashLensApp", "X / Twitter"]] },
              ].map((col) => (
                <div key={col.h}>
                  <p className="text-[12px] uppercase tracking-[0.08em] text-ink/50 mb-4">{col.h}</p>
                  <ul className="space-y-2 text-ink/70">
                    {col.l.map(([href, label]) => <li key={href}><a href={href} className="hover:text-ink">{label}</a></li>)}
                    {col.h === "Support" && <li><button onClick={() => setShowRestore(true)} className="hover:text-ink text-left">Restore purchase</button></li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="border-t border-ink/10 pt-6 text-[12px] text-ink/50">© {new Date().getFullYear()} PrivacyPage</p>
        </div>
      </footer>

      {/* Restore Modal */}
      {showRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={() => setShowRestore(false)} role="dialog" aria-modal="true">
          <div className="bg-white border border-ink/10 rounded-[8px] p-6 md:p-8 max-w-[400px] w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[24px] mb-2">Restore a purchase</h3>
            <p className="text-[14px] text-ink/70 mb-6">Enter your license key or the email you paid with.</p>
            <input
              type="text"
              value={restoreInput}
              onChange={(e) => setRestoreInput(e.target.value)}
              placeholder="PP-XXXXXXXX or email address"
              className="w-full h-12 border border-ink/15 rounded-[8px] px-4 text-[16px] font-mono placeholder-ink/40 focus:outline-none focus:border-seal mb-4"
            />
            {restoreStatus && (
              <p className={`text-[14px] mb-4 ${restoreStatus.includes("restored") ? "text-seal" : "text-red-700"}`}>{restoreStatus}</p>
            )}
            <div className="flex gap-2">
              <button onClick={handleRestore} disabled={!restoreInput.trim() || restoreLoading} className="flex-1 h-12 bg-seal hover:bg-seal-dark disabled:opacity-40 text-white rounded-[8px] text-[16px] font-medium">
                {restoreLoading ? "Checking…" : "Restore"}
              </button>
              <button onClick={() => setShowRestore(false)} className="h-12 px-6 border border-ink/15 rounded-[8px] text-[16px] text-ink/70">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Capture Modal (before checkout) */}
      {emailCapture && (
        <EmailCaptureModal
          description={emailCapture === "bundle" ? `All five documents, ${pricing?.bundleDisplay ?? ""} one-time.` : `Unlock any one document, ${pricing?.singleDisplay ?? ""} one-time.`}
          onSubmit={(email) => {
            const docType = emailCapture;
            setEmailCapture(null);
            startPayment(docType, email);
          }}
          onClose={() => setEmailCapture(null)}
        />
      )}

      {/* License Key Modal (payment success) */}
      {licenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className="bg-white border border-ink/10 rounded-[8px] p-6 md:p-8 max-w-[440px] w-full">
            <span className="w-10 h-10 rounded-full bg-seal text-white flex items-center justify-center mb-4"><CheckIcon className="w-5 h-5" /></span>
            <p className="font-mono text-[12px] text-seal mb-2">Checkout · complete</p>
            <h3 id="success-title" className="font-display text-[28px] leading-[1.2] mb-2">Payment successful</h3>
            <p className="text-[14px] leading-[1.5] text-ink/70 mb-6">Save your license key. You need it to restore your purchase on another device. We also email it to you.</p>
            <div className="flex items-center gap-2 border border-ink/10 bg-paper rounded-[8px] px-4 h-12 mb-4">
              <KeyIcon className="w-4 h-4 text-seal shrink-0" />
              <span className="font-mono text-[16px] tracking-[0.06em] select-all truncate" data-testid="license-key">{licenseModal}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigator.clipboard.writeText(licenseModal)} className="h-12 border border-ink/15 hover:border-ink/30 rounded-[8px] text-[16px] text-ink/80">Copy key</button>
              <button onClick={() => { setLicenseModal(null); window.location.reload(); }} className="h-12 bg-seal hover:bg-seal-dark text-white rounded-[8px] text-[16px] font-medium">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
