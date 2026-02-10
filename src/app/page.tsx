"use client";

import { useState, useEffect, useRef } from "react";
import Wizard from "@/components/Wizard";
import PolicyPreview from "@/components/PolicyPreview";
import { getWizardConfig, wizardConfigs } from "@/lib/wizardConfigs";
import { getLocalPricing, toSmallestUnit, type LocalPricing } from "@/lib/currency";
import { useRazorpay } from "@/hooks/useRazorpay";

function getSavingsDisplay(pricing: LocalPricing | null): string {
  if (!pricing) return "save $24.96";
  const savings = pricing.singlePrice * 5 - pricing.bundlePrice;
  const fmt = pricing.currency === "INR" ? Math.round(savings).toString() : savings.toFixed(2);
  return `save ${pricing.symbol}${fmt}`;
}

const faqItems = [
  { q: "Are these documents legally valid?", a: "Yes. Our documents are generated following current legal standards including GDPR, CCPA, CalOPPA, and COPPA. However, we recommend having a lawyer review them for your specific jurisdiction." },
  { q: "Can I edit the documents after generating?", a: "Yes! You can copy the document in Markdown, HTML, or plain text and edit it however you need." },
  { q: "What if I need changes later?", a: "Your license key gives you lifetime access. Generate updated documents anytime as laws change — we keep our templates current." },
  { q: "Do you store my data?", a: "We only store your email and license key for purchase verification. Your document inputs are processed in real-time and not stored on our servers." },
  { q: "Can I use these for multiple apps?", a: "Each purchase covers one set of documents. If you have multiple apps, the bundle is the best value." },
  { q: "What payment methods do you accept?", a: "We accept credit/debit cards, UPI, netbanking, and wallets via Razorpay. All payments are secure and encrypted." },
];

export default function Home() {
  const [policy, setPolicy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string> | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [pricing, setPricing] = useState<LocalPricing | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreInput, setRestoreInput] = useState("");
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [licenseModal, setLicenseModal] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wizardRef = useRef<HTMLDivElement>(null);
  const { openPayment } = useRazorpay();

  useEffect(() => {
    setPricing(getLocalPricing());
  }, []);

  // Auto-scroll to wizard when doc type selected
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
            localStorage.setItem("privacypage_pro_single", "true");
          } else {
            localStorage.setItem(`privacypage_unlocked_${p.docType}`, "true");
          }
          localStorage.setItem("privacypage_license_key", p.licenseKey);
        }
        setRestoreStatus("✅ Purchase restored! Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setRestoreStatus("❌ No purchase found. Check your license key or email.");
      }
    } catch {
      setRestoreStatus("❌ Something went wrong. Please try again.");
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
      setPolicy(json.policy);
    } catch {
      setPolicy("Error generating document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPolicy(null);
    setSelectedDocType(null);
  };

  return (
    <div className="min-h-screen">
      {/* Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PrivacyPage",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "url": "https://privacypage.io",
        "description": "Generate professional privacy policies, terms of service, EULAs, and more in 60 seconds. GDPR & CCPA compliant.",
        "offers": [
          { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free preview" },
          { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Pro - Single Document" },
          { "@type": "Offer", "price": "24.99", "priceCurrency": "USD", "description": "Bundle - All 5 Documents" }
        ]
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PrivacyPage",
        "url": "https://privacypage.io",
        "logo": "https://privacypage.io/icon.svg",
        "contactPoint": { "@type": "ContactPoint", "email": "rushirajjadeja@gmail.com", "contactType": "customer support" }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        }))
      }) }} />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="font-semibold text-lg">PrivacyPage</span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="/blog" className="text-sm text-zinc-400 hover:text-white transition-colors">Blog</a>
            <button onClick={() => setShowRestore(true)} className="text-sm text-zinc-400 hover:text-white transition-colors">Restore Purchase</button>
            <a href="#generate" className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors">Generate Free</a>
          </div>
          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white">Pricing</a>
            <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white">Blog</a>
            <button onClick={() => { setShowRestore(true); setMobileMenuOpen(false); }} className="block text-sm text-zinc-400 hover:text-white">Restore Purchase</button>
            <a href="#generate" onClick={() => setMobileMenuOpen(false)} className="block text-sm bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors text-center">Generate Free</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/50 text-sm text-zinc-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Built for indie developers &amp; startups
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Legal docs for your app.
            <br />
            <span className="gradient-text">Done in 60 seconds.</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Generate professional privacy policies, terms of service, EULAs, and more.
            GDPR &amp; CCPA compliant. App Store &amp; Play Store ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#generate" className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105 glow">
              Generate Your Docs — Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#generate" className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-8 py-4 rounded-xl text-lg font-medium transition-all">
              See How It Works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-zinc-500">
            {["GDPR Compliant", "CCPA Ready", "App Store Approved"].map((label) => (
              <span key={label} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why developers choose PrivacyPage</h2>
          <p className="text-zinc-400 text-center mb-16 max-w-xl mx-auto">Stop copying generic templates. Get legal docs customized for your exact needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "60-Second Generation", desc: "Answer a few questions. Our AI generates complete, customized legal documents instantly." },
              { icon: "🛡️", title: "Legally Compliant", desc: "GDPR, CCPA, CalOPPA, COPPA, and App Store/Play Store requirements — all covered automatically." },
              { icon: "📱", title: "App Store Ready", desc: "Formatted for iOS and Android app submissions. No more rejections for missing legal docs." },
              { icon: "🎯", title: "5 Document Types", desc: "Privacy Policy, Terms of Service, EULA, Cookie Policy, and Disclaimer — everything you need." },
              { icon: "📋", title: "Multiple Formats", desc: "Download as HTML, Markdown, or plain text. Host anywhere — your site, GitHub, or Notion." },
              { icon: "🔄", title: "Complete Package", desc: "Get all legal docs you need for launch. Bundle pricing saves you money and time." },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-6 hover:bg-zinc-800/60 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generator */}
      <section id="generate" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Document Type</h2>
          <p className="text-zinc-400 text-center mb-12">Select what you need to generate. Takes less than 60 seconds.</p>

          {!policy && !selectedDocType ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(wizardConfigs).map(([key, config]) => (
                <button key={key} onClick={() => setSelectedDocType(key)} className="glass-card rounded-2xl p-8 text-left hover:bg-zinc-800/60 hover:border-indigo-500/50 transition-all group">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-indigo-400 transition-colors">{config.displayName}</h3>
                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{config.description}</p>
                  <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
                    Generate
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </button>
              ))}
            </div>
          ) : selectedDocType && !policy ? (
            <div ref={wizardRef}>
              <button onClick={() => setSelectedDocType(null)} className="mb-6 text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2">← Back to document types</button>
              <Wizard config={getWizardConfig(selectedDocType)} onGenerate={handleGenerate} loading={loading} />
            </div>
          ) : (
            <PolicyPreview policy={policy!} formData={formData!} onReset={handleReset} docType={formData?.docType || "privacy"} />
          )}
        </div>
      </section>

      {/* Sample Document Preview */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">See what you&apos;ll get</h2>
          <p className="text-zinc-400 mb-12">Professional, comprehensive legal documents — generated in seconds.</p>
          <div className="relative glass-card rounded-2xl p-8 text-left max-w-2xl mx-auto overflow-hidden">
            <div className="font-mono text-sm text-zinc-300 space-y-2 leading-relaxed">
              <p className="text-indigo-400 font-semibold text-base">Privacy Policy for YourApp</p>
              <p className="text-zinc-500 text-xs">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              <br />
              <p>YourApp (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the YourApp mobile application. This page informs you of our policies regarding the collection, use, and disclosure of Personal Information.</p>
              <br />
              <p><strong className="text-zinc-200">1. Information We Collect</strong></p>
              <p>We collect several types of information for various purposes to provide and improve our Service to you.</p>
              <br />
              <p><strong className="text-zinc-200">1.1 Personal Data</strong></p>
              <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you, including but not limited to:</p>
              <p>• Email address</p>
              <p>• First and last name</p>
              <p>• Usage data and analytics</p>
              <br />
              <p><strong className="text-zinc-200">1.2 GDPR Compliance</strong></p>
              <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights...</p>
            </div>
            {/* Fade overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-900 via-zinc-900/90 to-transparent flex items-end justify-center pb-8">
              <a href="#generate" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105">
                Generate yours →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-zinc-400 mb-4">Generate for free. Upgrade to unlock full documents.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12 text-xs text-zinc-500">
            <span>💳 Cards</span>
            <span>📱 UPI</span>
            <span>🏦 Netbanking</span>
            <span>👛 Wallets</span>
            <span className="text-zinc-600">Powered by Razorpay</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-8 text-left">
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">{pricing?.symbol || "$"}0</div>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                {["Preview any document", "Basic compliance checks", "See how it works"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#generate" className="block text-center w-full border border-zinc-700 hover:border-zinc-500 py-3 rounded-xl text-sm font-medium transition-colors">Generate Free</a>
            </div>

            <div className="glass-card rounded-2xl p-8 text-left border-indigo-500/30">
              <h3 className="text-lg font-semibold mb-2">Pro (Per Doc)</h3>
              <div className="text-4xl font-bold mb-1">{pricing?.singleDisplay || "$9.99"}</div>
              <p className="text-sm text-zinc-500 mb-4">One-time payment per document</p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                {["Full document (no blur)", "GDPR & CCPA sections", "HTML, Markdown & text export", "Lifetime updates"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="block text-center w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl text-sm font-medium transition-colors" onClick={() => {
                if (!pricing) return;
                openPayment({ docType: "pro-single", currency: pricing.currency, amount: toSmallestUnit(pricing.singlePrice, pricing.currency), description: "Pro - Unlock Any Single Document", onSuccess: (licenseKey) => { localStorage.setItem("privacypage_pro_single", "true"); if (licenseKey) setLicenseModal(licenseKey); else { alert("🎉 Pro unlocked!"); window.location.reload(); } }, onFailure: () => {} });
              }}>Get Pro — {pricing?.singleDisplay || "$9.99"}</button>
            </div>

            <div className="glass-card rounded-2xl p-8 text-left border-indigo-500/50 relative">
              <div className="absolute -top-3 left-8 bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">Best Value</div>
              <h3 className="text-lg font-semibold mb-2">Bundle</h3>
              <div className="text-4xl font-bold mb-1">{pricing?.bundleDisplay || "$24.99"}</div>
              <p className="text-sm text-zinc-500 mb-4">All 5 documents ({getSavingsDisplay(pricing)})</p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                {["All 5 document types", "Privacy Policy", "Terms of Service", "EULA", "Cookie Policy + Disclaimer", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="block text-center w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl text-sm font-medium transition-colors" onClick={() => {
                if (!pricing) return;
                openPayment({ docType: "bundle", currency: pricing.currency, amount: toSmallestUnit(pricing.bundlePrice, pricing.currency), description: "Bundle - All 5 Documents", onSuccess: (licenseKey) => { if (licenseKey) setLicenseModal(licenseKey); else { alert("🎉 Bundle unlocked!"); window.location.reload(); } }, onFailure: () => {} });
              }}>Buy Bundle — {pricing?.bundleDisplay || "$24.99"}</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-zinc-400 text-center mb-12">Everything you need to know about PrivacyPage.</p>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className={`glass-card rounded-xl overflow-hidden transition-all ${openFaq === i ? "border-indigo-500/50" : ""}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 text-left flex items-center justify-between gap-4">
                  <span className="font-medium text-sm sm:text-base">{item.q}</span>
                  <svg className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-sm mb-4 text-zinc-300">Products</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="https://apps.apple.com/us/app/cashlens-personal-finance/id6743153951" className="hover:text-zinc-300 transition-colors" target="_blank" rel="noopener noreferrer">CashLens</a></li>
                <li><a href="https://invoicezen-seven.vercel.app" className="hover:text-zinc-300 transition-colors" target="_blank" rel="noopener noreferrer">InvoiceZen</a></li>
                <li><a href="#generate" className="hover:text-zinc-300 transition-colors">PrivacyPage</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-zinc-300">Support</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="mailto:rushirajjadeja@gmail.com?subject=PrivacyPage%20Support" className="hover:text-zinc-300 transition-colors">Contact Email</a></li>
                <li><button onClick={() => setShowRestore(true)} className="hover:text-zinc-300 transition-colors">Restore Purchase</button></li>
                <li><a href="#faq" className="hover:text-zinc-300 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-zinc-300">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-zinc-300">Social</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="https://x.com/cashLensApp" className="hover:text-zinc-300 transition-colors" target="_blank" rel="noopener noreferrer">@cashLensApp on X</a></li>
                <li><a href="https://rushiraj.me" className="hover:text-zinc-300 transition-colors" target="_blank" rel="noopener noreferrer">rushiraj.me</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">P</div>
              <span className="font-medium">PrivacyPage</span>
              <span className="text-zinc-500 text-sm">— Built by <a href="https://rushiraj.me" className="text-indigo-400 hover:text-indigo-300">Rushiraj</a></span>
            </div>
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} PrivacyPage. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Restore Purchase Modal */}
      {showRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowRestore(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">Restore Purchase</h3>
            <p className="text-zinc-400 text-sm mb-6">Enter your license key or email to restore your purchase on this device.</p>
            <input type="text" value={restoreInput} onChange={(e) => setRestoreInput(e.target.value)} placeholder="License key (PP-XXXXXXXX) or email" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 mb-4" />
            {restoreStatus && <p className="text-sm mb-4">{restoreStatus}</p>}
            <div className="flex gap-3">
              <button onClick={handleRestore} disabled={!restoreInput.trim() || restoreLoading} className="flex-1 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">{restoreLoading ? "Checking..." : "Restore"}</button>
              <button onClick={() => setShowRestore(false)} className="px-6 py-3 border border-zinc-700 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* License Key Modal */}
      {licenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-zinc-400 text-sm mb-6">Save your license key to restore your purchase on any device.</p>
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-4 font-mono text-lg tracking-wider text-indigo-400">{licenseModal}</div>
            <button onClick={() => { navigator.clipboard.writeText(licenseModal); }} className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-xl text-sm font-medium transition-colors mb-3">📋 Copy License Key</button>
            <button onClick={() => { setLicenseModal(null); window.location.reload(); }} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl text-sm font-medium transition-colors">Continue</button>
            <p className="text-zinc-500 text-xs mt-4">⚠️ Save this key! You&apos;ll need it to restore your purchase.</p>
          </div>
        </div>
      )}
    </div>
  );
}
