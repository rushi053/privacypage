"use client";

import { useState, useEffect } from "react";
import Wizard from "@/components/Wizard";
import PolicyPreview from "@/components/PolicyPreview";
import { getWizardConfig, wizardConfigs } from "@/lib/wizardConfigs";
import { getLocalPricing, toSmallestUnit, type LocalPricing } from "@/lib/currency";
import { useRazorpay } from "@/hooks/useRazorpay";

export default function Home() {
  const [policy, setPolicy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string> | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [pricing, setPricing] = useState<LocalPricing | null>(null);
  const { openPayment } = useRazorpay();

  useEffect(() => {
    setPricing(getLocalPricing());
  }, []);

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
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <span className="font-semibold text-lg">PrivacyPage</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#generate" className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors">
              Generate Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/50 text-sm text-zinc-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Trusted by 500+ app developers
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Legal docs for your app.
            <br />
            <span className="gradient-text">Done in 60 seconds.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Generate professional privacy policies, terms of service, EULAs, and more.
            GDPR & CCPA compliant. App Store & Play Store ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#generate"
              className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105 glow"
            >
              Generate Your Docs — Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-8 py-4 rounded-xl text-lg font-medium transition-all"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              GDPR Compliant
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              CCPA Ready
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              App Store Approved
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why developers choose PrivacyPage
          </h2>
          <p className="text-zinc-400 text-center mb-16 max-w-xl mx-auto">
            Stop copying generic templates. Get legal docs customized for your exact needs.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "60-Second Generation",
                desc: "Answer a few questions. Our AI generates complete, customized legal documents instantly.",
              },
              {
                icon: "🛡️",
                title: "Legally Compliant",
                desc: "GDPR, CCPA, CalOPPA, COPPA, and App Store/Play Store requirements — all covered automatically.",
              },
              {
                icon: "📱",
                title: "App Store Ready",
                desc: "Formatted for iOS and Android app submissions. No more rejections for missing legal docs.",
              },
              {
                icon: "🎯",
                title: "5 Document Types",
                desc: "Privacy Policy, Terms of Service, EULA, Cookie Policy, and Disclaimer — everything you need.",
              },
              {
                icon: "📋",
                title: "Multiple Formats",
                desc: "Download as HTML, Markdown, or plain text. Host anywhere — your site, GitHub, or Notion.",
              },
              {
                icon: "🔄",
                title: "Complete Package",
                desc: "Get all legal docs you need for launch. Bundle pricing saves you money and time.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-6 hover:bg-zinc-800/60 transition-all"
              >
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
          <h2 className="text-3xl font-bold text-center mb-4">
            Choose Your Document Type
          </h2>
          <p className="text-zinc-400 text-center mb-12">
            Select what you need to generate. Takes less than 60 seconds.
          </p>

          {!policy && !selectedDocType ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(wizardConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDocType(key)}
                  className="glass-card rounded-2xl p-8 text-left hover:bg-zinc-800/60 hover:border-indigo-500/50 transition-all group"
                >
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-indigo-400 transition-colors">
                    {config.displayName}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                    {config.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
                    Generate
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : selectedDocType && !policy ? (
            <div>
              <button
                onClick={() => setSelectedDocType(null)}
                className="mb-6 text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
              >
                ← Back to document types
              </button>
              <Wizard
                config={getWizardConfig(selectedDocType)}
                onGenerate={handleGenerate}
                loading={loading}
              />
            </div>
          ) : (
            <PolicyPreview
              policy={policy!}
              formData={formData!}
              onReset={handleReset}
              docType={formData?.docType || "privacy"}
            />
          )}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-zinc-400 mb-4">
            Generate for free. Upgrade to unlock full documents.
          </p>
          <div className="flex items-center justify-center gap-4 mb-12 text-xs text-zinc-500">
            <span>💳 Cards</span>
            <span>📱 UPI</span>
            <span>🏦 Netbanking</span>
            <span>👛 Wallets</span>
            <span className="text-zinc-600">Powered by Razorpay</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-8 text-left">
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">{pricing?.symbol || "$"}0</div>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                {["Preview any document", "Basic compliance checks", "See how it works"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#generate"
                className="block text-center w-full border border-zinc-700 hover:border-zinc-500 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Generate Free
              </a>
            </div>

            <div className="glass-card rounded-2xl p-8 text-left border-indigo-500/30">
              <h3 className="text-lg font-semibold mb-2">Pro (Per Doc)</h3>
              <div className="text-4xl font-bold mb-1">
                {pricing?.singleDisplay || "$9.99"}
              </div>
              <p className="text-sm text-zinc-500 mb-4">One-time payment per document</p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                {[
                  "Full document (no blur)",
                  "GDPR & CCPA sections",
                  "HTML, Markdown & text export",
                  "Lifetime updates",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#generate"
                className="block text-center w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Get Pro — {pricing?.singleDisplay || "$9.99"}
              </a>
            </div>

            <div className="glass-card rounded-2xl p-8 text-left border-indigo-500/50 relative">
              <div className="absolute -top-3 left-8 bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                Best Value
              </div>
              <h3 className="text-lg font-semibold mb-2">Bundle</h3>
              <div className="text-4xl font-bold mb-1">
                {pricing?.bundleDisplay || "$24.99"}
              </div>
              <p className="text-sm text-zinc-500 mb-4">All 5 documents (save {pricing?.currency === "INR" ? "₹2146" : pricing?.currency === "EUR" ? "€23.96" : pricing?.currency === "GBP" ? "£19.96" : "$24.96"})</p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                {[
                  "All 5 document types",
                  "Privacy Policy",
                  "Terms of Service",
                  "EULA",
                  "Cookie Policy + Disclaimer",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="block text-center w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl text-sm font-medium transition-colors"
                onClick={() => {
                  if (!pricing) return;
                  openPayment({
                    docType: "bundle",
                    currency: pricing.currency,
                    amount: toSmallestUnit(pricing.bundlePrice, pricing.currency),
                    description: "Bundle - All 5 Documents",
                    onSuccess: () => {
                      alert("🎉 Bundle unlocked! All 5 documents are now available.");
                      window.location.reload();
                    },
                    onFailure: () => {},
                  });
                }}
              >
                Buy Bundle — {pricing?.bundleDisplay || "$24.99"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="font-medium">PrivacyPage</span>
            <span className="text-zinc-500 text-sm">
              — Built by{" "}
              <a href="https://rushiraj.me" className="text-indigo-400 hover:text-indigo-300">
                Rushiraj
              </a>
            </span>
          </div>
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} PrivacyPage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
