import { PRICE } from '@/lib/currency'
import { PriceLocalizer } from '@/components/PriceLocalizer'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

// Clause chrome for /vs, /compliance, and the legacy /for builder pages.
// Platform guides use ClauseShell. These links are the ones this shell already had.
const FOOTER_LINKS: [string, string][] = [
  ['/for', 'All platforms'],
  ['/for/ios-app', 'iOS'],
  ['/for/android-app', 'Android'],
  ['/for/chrome-extension', 'Chrome'],
  ['/pricing', 'Pricing'],
]

export function SeoPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink font-ui">
      <header className="border-b border-ink/10">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 md:px-8 min-h-16 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="flex items-center gap-2 min-h-11">
            <Logo className="w-8 h-8 shrink-0" />
            <span className="font-display text-[20px] tracking-[-0.01em]">PrivacyPage</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2 sm:gap-4">
            <Link href="/blog" className="inline-flex items-center h-11 px-3 text-[14px] text-ink/70 hover:text-ink">
              Blog
            </Link>
            <Link
              href="/#generate"
              className="inline-flex items-center justify-center h-11 px-4 rounded-[8px] bg-seal text-white text-[14px] font-medium hover:bg-seal-dark"
            >
              Generate free
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1040px] px-6 md:px-8 pt-16 md:pt-24 pb-16">
        <PriceLocalizer />
        {children}
      </main>

      <footer className="border-t border-ink/10 py-16">
        <div className="mx-auto max-w-[1040px] px-6 md:px-8">
          <p className="font-display text-[18px] mb-4">PrivacyPage</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-1 mb-6 text-[14px]">
            {FOOTER_LINKS.map(([href, label]) => (
              <Link key={href} href={href} className="inline-flex items-center min-h-11 text-ink/70 hover:text-ink">
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-[14px] text-ink/50">© {new Date().getFullYear()} PrivacyPage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export function SeoCtaCard({
  heading = 'Generate your privacy policy in 60 seconds',
  sub = `Professional, legally compliant documents for your app — free to preview, ${PRICE.single} one-time to unlock.`,
}: {
  heading?: string
  sub?: string
}) {
  return (
    <div className="mt-16 rounded-[8px] border border-ink/10 bg-white p-6 md:p-8">
      <h2 className="font-display text-[28px] md:text-[32px] leading-[1.2] tracking-[-0.01em] mb-4">{heading}</h2>
      <p className="font-doc text-[18px] leading-[1.6] text-ink/80 mb-6">{sub}</p>
      <Link
        href="/#generate"
        className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[8px] bg-seal text-white text-[16px] font-medium hover:bg-seal-dark"
      >
        Generate now
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  )
}

export function SeoFaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <section className="mt-16 border-t border-ink/10 pt-16">
      <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-8">FAQ</h2>
      <dl className="space-y-8">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-display text-[20px] leading-[1.3] mb-2">{f.q}</dt>
            <dd className="font-doc text-[18px] leading-[1.6] text-ink/85">{f.a}</dd>
          </div>
        ))}
      </dl>
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
    <nav className="mt-16 border-t border-ink/10 pt-16" aria-label={heading}>
      <h2 className="font-display text-[24px] leading-[1.3] mb-6">{heading}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center min-h-12 px-4 py-4 rounded-[8px] border border-ink/10 bg-white hover:border-seal/40"
            >
              <h3 className="font-display text-[18px] leading-[1.35]">{l.label}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
