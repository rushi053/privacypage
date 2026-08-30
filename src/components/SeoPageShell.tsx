import Link from 'next/link'
import { Logo } from '@/components/Logo'

// Shared shell (nav + CTA banner + footer) for the /for, /vs, and /compliance
// landing pages. Server-safe — mirrors the blog page chrome.
export function SeoPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* CTA Banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-indigo-50 border-b border-indigo-100 py-3 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Need a privacy policy?</span> Generate one for free in 60 seconds →
          </p>
          <Link href="/#generate" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            Generate Free
          </Link>
        </div>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-gray-900">PrivacyPage</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Blog</Link>
            <Link href="/#generate" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">Generate Free</Link>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-20 px-6">{children}</main>

      <footer className="border-t border-gray-200 py-8 px-6 text-center text-gray-500 text-sm bg-gray-50">
        © {new Date().getFullYear()} PrivacyPage. All rights reserved.
      </footer>
    </div>
  )
}

export function SeoCtaCard({
  heading = 'Generate your privacy policy in 60 seconds',
  sub = 'Professional, legally compliant documents for your app — free to preview, $9.99 one-time to unlock.',
}: {
  heading?: string
  sub?: string
}) {
  return (
    <div className="mt-16 glass-card rounded-2xl p-8 text-center border-indigo-600">
      <h2 className="text-2xl font-bold mb-3 text-gray-900">{heading}</h2>
      <p className="text-gray-600 mb-6">{sub}</p>
      <Link href="/#generate" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105">
        Generate Now →
      </Link>
    </div>
  )
}

export function SeoFaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">FAQ</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.q} className="border border-gray-100 rounded-xl p-5 bg-white">
            <h3 className="font-semibold text-sm text-gray-900 mb-2">{f.q}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SeoRelatedLinks({
  heading,
  links,
}: {
  heading: string
  links: { href: string; label: string }[]
}) {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-5 text-gray-900">{heading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="glass-card rounded-xl p-5 hover:border-indigo-600 transition-all group">
            <h3 className="font-semibold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">{l.label}</h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
