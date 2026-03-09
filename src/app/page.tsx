"use client";

import { useState, useEffect, useRef } from "react";
import Wizard from "@/components/Wizard";
import PolicyPreview from "@/components/PolicyPreview";
import { getWizardConfig, wizardConfigs } from "@/lib/wizardConfigs";
import { getLocalPricing, toSmallestUnit, type LocalPricing } from "@/lib/currency";
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
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon
} from "@/components/Icons";
import { FadeInView } from "@/components/FadeInView";
import { HeroIllustration, SecurityIllustration, DocumentIllustration, TrustedPlatformsLogos } from "@/components/Illustrations";

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
    <div className="min-h-screen bg-white">
      {/* FAQ Schema Markup */}
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
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-gray-900">PrivacyPage</span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            <a href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Blog</a>
            <button onClick={() => setShowRestore(true)} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Restore Purchase</button>
            <a href="#generate" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">Generate Free</a>
          </div>
          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
          <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900">FAQ</a>
            <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900">Blog</a>
            <button onClick={() => { setShowRestore(true); setMobileMenuOpen(false); }} className="block text-sm text-gray-600 hover:text-gray-900">Restore Purchase</button>
            <a href="#generate" onClick={() => setMobileMenuOpen(false)} className="block text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-center">Generate Free</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 gradient-bg relative overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-gray-700 mb-8 soft-shadow">
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free to try • No signup required • One-time payment
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-gray-900">
                Privacy policies for your app.
                <br />
                <span className="text-indigo-600">Done in 60 seconds.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6">
                Generate professional privacy policies, terms of service, EULAs, and more.
                GDPR &amp; CCPA compliant. App Store &amp; Play Store ready.
              </p>
              <p className="text-sm text-gray-500 mb-10">
                Built by <a href="https://rushiraj.me" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium underline decoration-dotted">Rushiraj</a> — a solo developer who got tired of paying $20/month for legal docs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start relative z-10">
                <a href="#generate" className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-xl">
                  Generate Your Docs — Free
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
                <a href="#demo" className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 bg-white px-10 py-5 rounded-xl text-lg font-semibold transition-all soft-shadow hover:shadow-lg">
                  See How It Works
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8 text-sm text-gray-500">
                {["GDPR Compliant", "CCPA Ready", "App Store Approved"].map((label) => (
                  <span key={label} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Right: Illustration */}
            <div className="hidden lg:block">
              <HeroIllustration className="w-full h-auto animate-float" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeInView>
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">How it works</h2>
            <p className="text-gray-600 text-center mb-16 max-w-xl mx-auto">Get your legal documents in three simple steps</p>
          </FadeInView>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-[16.666%] right-[16.666%] h-0.5 bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 opacity-20" />
            
            <FadeInView delay={100} className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6 relative z-10 border-2 border-indigo-100">
                <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Choose your document</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Select from Privacy Policy, Terms of Service, EULA, and more</p>
            </FadeInView>

            <FadeInView delay={200} className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6 relative z-10 border-2 border-indigo-100">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Answer a few questions</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Tell us about your app, data collection, and compliance needs</p>
            </FadeInView>

            <FadeInView delay={300} className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6 relative z-10 border-2 border-indigo-100">
                <CheckBadgeIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Get your legal docs</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Download in HTML, Markdown, or text. Ready to publish instantly</p>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <FadeInView>
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Why developers choose PrivacyPage</h2>
            <p className="text-gray-600 text-center mb-16 max-w-xl mx-auto">Stop copying generic templates. Get legal docs actually customized for your app.</p>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: BoltIcon, title: "60-Second Generation", desc: "Answer a few questions. Get complete, customized legal documents instantly. No account needed." },
              { Icon: ShieldCheckIcon, title: "Legally Compliant", desc: "GDPR, CCPA, CalOPPA, COPPA, and App Store/Play Store requirements — all covered automatically." },
              { Icon: DevicePhoneMobileIcon, title: "App Store Ready", desc: "Formatted for iOS and Android submissions. No more rejections for missing or incomplete legal docs." },
              { Icon: BanknotesIcon, title: "One-Time Payment", desc: "Pay once, own forever. No monthly subscriptions. Termly charges $10/month — we charge $9.99 once." },
              { Icon: DocumentDuplicateIcon, title: "Multiple Formats", desc: "Download as HTML, Markdown, or plain text. Host anywhere — your site, GitHub, Notion, or S3." },
              { Icon: ArrowPathIcon, title: "Lifetime Updates", desc: "Laws change. Your license key lets you regenerate updated docs anytime at no extra cost." },
            ].map((f, idx) => (
              <FadeInView key={f.title} delay={idx * 100}>
                <div className="glass-card rounded-2xl p-6 transition-all h-full">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                    <f.Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeInView>
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">Compliance you can rely on</h2>
            <p className="text-gray-600 text-center mb-12 text-sm">Built to meet the highest privacy and security standards</p>
          </FadeInView>

          <FadeInView delay={150}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                { label: "GDPR", sublabel: "EU Compliant" },
                { label: "CCPA", sublabel: "California Ready" },
                { label: "App Store", sublabel: "iOS Approved" },
                { label: "Play Store", sublabel: "Android Ready" },
                { label: "SSL Secure", sublabel: "Encrypted" },
              ].map((badge) => (
                <div key={badge.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center hover:border-gray-300 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="font-semibold text-sm text-gray-900 mb-1">{badge.label}</div>
                  <div className="text-xs text-gray-500">{badge.sublabel}</div>
                </div>
              ))}
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Social Proof - Trusted Platforms */}
      <section className="py-20 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <FadeInView>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Trusted by developers building for</h2>
            <p className="text-gray-600 mb-12 text-sm">Join developers shipping to the world&apos;s top platforms</p>
          </FadeInView>
          <FadeInView delay={150}>
            <TrustedPlatformsLogos className="text-gray-600" />
          </FadeInView>
        </div>
      </section>

      {/* Real Demo Section */}
      <section id="demo" className="py-20 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInView>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">See what you&apos;ll get</h2>
            <p className="text-gray-600 mb-12">Professional, comprehensive legal documents — generated in seconds.</p>
          </FadeInView>
          <FadeInView delay={150}>
            <div className="relative glass-card rounded-2xl p-8 text-left max-w-2xl mx-auto overflow-hidden">
            <div className="font-mono text-sm text-gray-700 space-y-2 leading-relaxed [&>p]:opacity-0 [&>p]:[animation:typing_0.5s_ease-out_forwards] [&>p:nth-child(1)]:[animation-delay:0.1s] [&>p:nth-child(2)]:[animation-delay:0.25s] [&>p:nth-child(3)]:[animation-delay:0.4s] [&>p:nth-child(4)]:[animation-delay:0.55s] [&>p:nth-child(5)]:[animation-delay:0.7s] [&>p:nth-child(n+6)]:[animation-delay:0.85s]">
              <p className="text-indigo-600 font-semibold text-base">Privacy Policy for YourApp</p>
              <p className="text-gray-500 text-xs">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              <br />
              <p>YourApp (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the YourApp mobile application. This page informs you of our policies regarding the collection, use, and disclosure of Personal Information.</p>
              <br />
              <p><strong className="text-gray-900">1. Information We Collect</strong></p>
              <p>We collect several types of information for various purposes to provide and improve our Service to you.</p>
              <br />
              <p><strong className="text-gray-900">1.1 Personal Data</strong></p>
              <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you, including but not limited to:</p>
              <p>• Email address</p>
              <p>• First and last name</p>
              <p>• Usage data and analytics</p>
              <br />
              <p><strong className="text-gray-900">1.2 GDPR Compliance</strong></p>
              <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data...</p>
              <br />
              <p><strong className="text-gray-900">2. How We Use Your Information</strong></p>
              <p>YourApp uses the collected data for various purposes:</p>
              <p>• To provide and maintain our Service</p>
              <p>• To notify you about changes to our Service</p>
              <p>• To provide customer support</p>
            </div>
            {/* Fade overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-8">
              <a href="#generate" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 soft-shadow">
                Generate yours for free →
              </a>
            </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">This is a real preview. Your document will be customized with your app&apos;s name, data practices, and jurisdiction.</p>
          </FadeInView>
        </div>
      </section>

      {/* Reassurance Section - You're Almost Done */}
      <section className="py-20 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeInView>
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Everything you need to launch</h2>
            <p className="text-gray-600 text-center mb-12">You&apos;re so close. Don&apos;t let missing legal docs hold you back.</p>
          </FadeInView>
          
          <FadeInView delay={150}>
            <div className="max-w-2xl mx-auto">
              {/* Progress Steps */}
              <div className="space-y-6">
                {[
                  { icon: "✅", label: "Built your app or website", done: true },
                  { icon: "✅", label: "Ready to submit to App Store / Play Store", done: true },
                  { icon: "👉", label: "Generate your legal docs", current: true, subtext: "You are here! Takes 60 seconds." },
                  { icon: "⬜", label: "Submit and get approved", upcoming: true, subtext: "After generating, you'll have everything needed for approval." },
                ].map((step, idx) => (
                  <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                    step.current ? 'bg-indigo-50 border-2 border-indigo-600 animate-pulse-slow' : 
                    step.done ? 'bg-gray-50 border border-gray-200' : 
                    'bg-gray-50 border border-gray-200 opacity-60'
                  }`}>
                    <span className="text-2xl flex-shrink-0">{step.icon}</span>
                    <div className="flex-1">
                      <p className={`font-medium ${step.current ? 'text-indigo-900' : 'text-gray-900'}`}>{step.label}</p>
                      {step.subtext && (
                        <p className={`text-sm mt-1 ${step.current ? 'text-indigo-700' : 'text-gray-600'}`}>{step.subtext}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10 text-center">
                <a href="#generate" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg">
                  Let&apos;s do this →
                </a>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Generator */}
      <section id="generate" className="py-20 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Choose Your Document Type</h2>
          <p className="text-gray-600 text-center mb-12">Select what you need to generate. Free preview — no signup required.</p>

          {!policy && !selectedDocType ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(wizardConfigs).map(([key, config]) => (
                <button key={key} onClick={() => setSelectedDocType(key)} className="glass-card rounded-2xl p-8 text-left hover:border-indigo-600 transition-all group">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors">{config.displayName}</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{config.description}</p>
                  <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                    Generate
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </button>
              ))}
            </div>
          ) : selectedDocType && !policy ? (
            <div ref={wizardRef}>
              <button onClick={() => setSelectedDocType(null)} className="mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
                ← Back to document types
              </button>
              <Wizard config={getWizardConfig(selectedDocType)} onGenerate={handleGenerate} loading={loading} />
            </div>
          ) : (
            <PolicyPreview policy={policy!} formData={formData!} onReset={handleReset} docType={formData?.docType || "privacy"} />
          )}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInView>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Simple pricing. No subscriptions.</h2>
            <p className="text-gray-600 mb-4">Generate for free. Pay once to unlock — no monthly fees.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 text-xs text-gray-500">
              <span>💳 Cards</span>
              <span>📱 UPI</span>
              <span>🏦 Netbanking</span>
              <span>👛 Wallets</span>
              <span className="text-gray-400">Powered by Razorpay</span>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FadeInView delay={100}>
              <div className="glass-card rounded-2xl p-8 text-left hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Free Preview</h3>
                <div className="text-4xl font-bold mb-4 text-gray-900">{pricing?.symbol || "$"}0</div>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  {["Preview any document", "See full structure", "Test the generator", "No signup required"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#generate" className="block text-center w-full border border-gray-300 hover:border-gray-400 py-3 rounded-xl text-sm font-medium transition-colors text-gray-700 bg-white">Generate Free</a>
              </div>
            </FadeInView>

            <FadeInView delay={200}>
              <div className="glass-card rounded-2xl p-8 text-left border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Pro</h3>
                <div className="text-4xl font-bold mb-1 text-gray-900">{pricing?.singleDisplay || "$9.99"}</div>
                <p className="text-sm text-gray-600 mb-4">One-time payment • Any single document</p>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  {["Full document (no blur)", "GDPR & CCPA sections", "HTML, Markdown & text", "Lifetime updates", "Copy-paste ready"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="block text-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-medium transition-colors mb-3" onClick={() => {
                  if (!pricing) return;
                  openPayment({ docType: "pro-single", currency: pricing.currency, amount: toSmallestUnit(pricing.singlePrice, pricing.currency), description: "Pro - Unlock Any Single Document", onSuccess: (licenseKey) => { localStorage.setItem("privacypage_pro_single", "true"); if (licenseKey) setLicenseModal(licenseKey); else { alert("🎉 Pro unlocked!"); window.location.reload(); } }, onFailure: () => {} });
                }}>Get Pro — {pricing?.singleDisplay || "$9.99"}</button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-2">
                  <LockClosedIcon className="w-3.5 h-3.5" />
                  <span>Secure payment via Razorpay</span>
                </div>
                <p className="text-xs text-gray-500 text-center">vs. Termly: $10/month = $120/year</p>
              </div>
            </FadeInView>

            <FadeInView delay={300}>
              <div className="glass-card rounded-2xl p-8 text-left border-indigo-600 bg-indigo-50 relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-3 left-8 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full animate-pulse-glow">Best Value</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Bundle</h3>
                <div className="text-4xl font-bold mb-1 text-gray-900">{pricing?.bundleDisplay || "$24.99"}</div>
                <p className="text-sm text-gray-600 mb-4">All 5 documents • {getSavingsDisplay(pricing)}</p>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  {["Privacy Policy", "Terms of Service", "EULA", "Cookie Policy", "Disclaimer", "Priority email support"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="block text-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-medium transition-colors mb-3" onClick={() => {
                  if (!pricing) return;
                  openPayment({ docType: "bundle", currency: pricing.currency, amount: toSmallestUnit(pricing.bundlePrice, pricing.currency), description: "Bundle - All 5 Documents", onSuccess: (licenseKey) => { if (licenseKey) setLicenseModal(licenseKey); else { alert("🎉 Bundle unlocked!"); window.location.reload(); } }, onFailure: () => {} });
                }}>Buy Bundle — {pricing?.bundleDisplay || "$24.99"}</button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-2">
                  <LockClosedIcon className="w-3.5 h-3.5" />
                  <span>Secure payment via Razorpay</span>
                </div>
                <p className="text-xs text-gray-500 text-center">vs. Termly bundle: $25/month = $300/year</p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <FadeInView>
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-center mb-12">Everything you need to know about PrivacyPage.</p>
          </FadeInView>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FadeInView key={i} delay={i * 50}>
                <div className={`glass-card rounded-xl overflow-hidden transition-all ${openFaq === i ? "border-indigo-600" : ""}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 text-left flex items-center justify-between gap-4">
                  <span className="font-medium text-sm sm:text-base text-gray-900">{item.q}</span>
                  <svg className={`w-5 h-5 text-gray-600 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA - Last Step */}
      <section className="py-20 px-6 border-t border-gray-200 bg-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInView>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">One step away from launch</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              You&apos;ve built something great. Don&apos;t let missing legal docs hold you back. Generate yours now — it takes 60 seconds.
            </p>
            <a href="#generate" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-xl text-xl font-semibold transition-all hover:scale-105 shadow-lg mb-6">
              Generate Your Legal Docs — Free →
            </a>
            <p className="text-sm text-gray-600">No signup. No credit card. Preview first, pay only when you&apos;re ready.</p>
          </FadeInView>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-900">Products</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="https://apps.apple.com/us/app/cashlens-personal-finance/id6743153951" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all" target="_blank" rel="noopener noreferrer">CashLens</a></li>
                <li><a href="https://invoicezen-seven.vercel.app" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all" target="_blank" rel="noopener noreferrer">InvoiceZen</a></li>
                <li><a href="#generate" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all">PrivacyPage</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-900">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="mailto:rushirajjadeja@gmail.com?subject=PrivacyPage%20Support" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all">Contact Email</a></li>
                <li><button onClick={() => setShowRestore(true)} className="hover:text-gray-900 hover:underline underline-offset-2 transition-all">Restore Purchase</button></li>
                <li><a href="#faq" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-900">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="mailto:rushirajjadeja@gmail.com?subject=PrivacyPage%20Legal%20Inquiry" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all">Contact for Legal</a></li>
                <li><a href="https://github.com/rushiraj" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-900">Social</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="https://x.com/cashLensApp" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all" target="_blank" rel="noopener noreferrer">@cashLensApp on X</a></li>
                <li><a href="https://rushiraj.me" className="hover:text-gray-900 hover:underline underline-offset-2 transition-all" target="_blank" rel="noopener noreferrer">rushiraj.me</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Logo className="w-6 h-6" />
                <span className="font-medium text-gray-900">PrivacyPage</span>
                <span className="text-gray-500 text-sm">— Built by <a href="https://rushiraj.me" className="text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-2 transition-all">Rushiraj</a></span>
              </div>
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} PrivacyPage. All rights reserved.</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs">Indie-made with care in India 🇮🇳</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Restore Purchase Modal */}
      {showRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowRestore(false)}>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full mx-4 soft-shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Restore Purchase</h3>
            <p className="text-gray-600 text-sm mb-6">Enter your license key or email to restore your purchase on this device.</p>
            <input type="text" value={restoreInput} onChange={(e) => setRestoreInput(e.target.value)} placeholder="License key (PP-XXXXXXXX) or email" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 mb-4" />
            {restoreStatus && <p className="text-sm mb-4">{restoreStatus}</p>}
            <div className="flex gap-3">
              <button onClick={handleRestore} disabled={!restoreInput.trim() || restoreLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">{restoreLoading ? "Checking..." : "Restore"}</button>
              <button onClick={() => setShowRestore(false)} className="px-6 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* License Key Modal */}
      {licenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full mx-4 text-center soft-shadow-lg">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Payment Successful!</h3>
            <p className="text-gray-600 text-sm mb-6">Save your license key to restore your purchase on any device.</p>
            <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 mb-4 font-mono text-lg tracking-wider text-indigo-600">{licenseModal}</div>
            <button onClick={() => { navigator.clipboard.writeText(licenseModal); }} className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 py-3 rounded-xl text-sm font-medium transition-colors mb-3">📋 Copy License Key</button>
            <button onClick={() => { setLicenseModal(null); window.location.reload(); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-medium transition-colors">Continue</button>
            <p className="text-gray-500 text-xs mt-4">⚠️ Save this key! You&apos;ll need it to restore your purchase.</p>
          </div>
        </div>
      )}
    </div>
  );
}
