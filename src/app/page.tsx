"use client";

import { useState } from "react";
import Wizard from "@/components/Wizard";
import PolicyPreview from "@/components/PolicyPreview";

export default function Home() {
  const [policy, setPolicy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string> | null>(null);

  const handleGenerate = async (data: Record<string, string>) => {
    setLoading(true);
    setFormData(data);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      setPolicy(json.policy);
    } catch {
      setPolicy("Error generating policy. Please try again.");
    } finally {
      setLoading(false);
    }
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
            Privacy policies
            <br />
            <span className="gradient-text">that actually work.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Generate professional, legally-compliant privacy policies for your iOS,
            Android, or web app in under 60 seconds. App Store & Play Store ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#generate"
              className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105 glow"
            >
              Generate Your Policy — Free
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
            Stop copying generic templates. Get policies customized for your exact app.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "60-Second Generation",
                desc: "Answer a few questions about your app. Our AI generates a complete, customized privacy policy instantly.",
              },
              {
                icon: "🛡️",
                title: "Legally Compliant",
                desc: "GDPR, CCPA, CalOPPA, COPPA, and App Store/Play Store requirements — all covered automatically.",
              },
              {
                icon: "📱",
                title: "App Store Ready",
                desc: "Formatted specifically for iOS and Android app submissions. No more rejection for missing privacy policies.",
              },
              {
                icon: "🎯",
                title: "Customized, Not Generic",
                desc: "Tailored to your app's specific data collection, third-party SDKs, analytics, and features.",
              },
              {
                icon: "📋",
                title: "Multiple Formats",
                desc: "Download as HTML, Markdown, or plain text. Host it anywhere — your website, GitHub Pages, or Notion.",
              },
              {
                icon: "🔄",
                title: "Terms of Service Too",
                desc: "Get a matching Terms of Service and EULA alongside your privacy policy. Full legal coverage.",
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Generate Your Privacy Policy
          </h2>
          <p className="text-zinc-400 text-center mb-12">
            Fill in the details below. Takes less than 60 seconds.
          </p>

          {!policy ? (
            <Wizard onGenerate={handleGenerate} loading={loading} />
          ) : (
            <PolicyPreview policy={policy} formData={formData!} onReset={() => setPolicy(null)} />
          )}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-zinc-400 mb-12">
            Generate for free. Upgrade to unlock full policies.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl p-8 text-left">
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0</div>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                {["Preview privacy policy", "Basic compliance checks", "Standard template"].map((f) => (
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
            <div className="glass-card rounded-2xl p-8 text-left border-indigo-500/50 relative">
              <div className="absolute -top-3 left-8 bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-1">
                $9<span className="text-lg text-zinc-400">.99</span>
              </div>
              <p className="text-sm text-zinc-500 mb-4">One-time payment</p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                {[
                  "Full privacy policy (no blur)",
                  "Terms of Service included",
                  "EULA included",
                  "GDPR & CCPA sections",
                  "HTML, Markdown & text export",
                  "Lifetime updates",
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
                onClick={() => alert("Payment integration coming soon! We'll notify you when it's ready.")}
              >
                Get Pro — $9.99
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
