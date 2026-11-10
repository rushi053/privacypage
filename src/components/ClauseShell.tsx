import Link from 'next/link'
import { Fraunces, Newsreader, Geist, Geist_Mono } from 'next/font/google'

// Shared "Clause" chrome (fonts, header, footer) for platform pages, the /for hub and /pricing.
const fraunces = Fraunces({ subsets: ['latin'], variable: '--f-display', display: 'swap' })
const newsreader = Newsreader({ subsets: ['latin'], variable: '--f-doc', display: 'swap' })
const geist = Geist({ subsets: ['latin'], variable: '--f-ui', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--f-mono', display: 'swap' })

export const FOOTER_PLATFORM_LINKS: [string, string][] = [
  ['/for', 'All platforms'],
  ['/for/ios-app', 'iOS apps'],
  ['/for/android-app', 'Android apps'],
  ['/for/flutter-app', 'Flutter apps'],
  ['/for/react-native-app', 'React Native apps'],
  ['/for/chrome-extension', 'Chrome extensions'],
  ['/for/discord-bot', 'Discord bots'],
]

export function ClauseFooter() {
  const cols: { h: string; l: [string, string][] }[] = [
    { h: 'Product', l: [['/#generate', 'Generate'], ['/pricing', 'Pricing'], ['/blog', 'Guides'], ['/guides/app-rejected-privacy-policy', 'Fix a rejection']] },
    { h: 'Platforms', l: FOOTER_PLATFORM_LINKS },
    { h: 'Compliance', l: [['/compliance/gdpr', 'GDPR'], ['/compliance/ccpa', 'CCPA'], ['/compliance/dpdp', 'DPDP Act (India)']] },
  ]
  return (
    <footer className="border-t border-[#16181D]/10 py-16">
      <div className="mx-auto max-w-[1040px] px-6 md:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-[14px]">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-[family-name:var(--f-display)] text-[18px] mb-2">PrivacyPage</p>
          <p className="text-[#16181D]/60 leading-[1.5]">Privacy policies for indie developers. Not legal advice.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#16181D]/50 mb-4">{c.h}</p>
            <ul className="space-y-2 text-[#16181D]/70">
              {c.l.map(([href, label]) => <li key={href}><Link href={href} className="hover:text-[#16181D]">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}

// Child routes already render their own <main> (pricing, /for, platform guides, rejection guide).
// The skip target is a div so those landmarks stay the only <main> on the page.
// Important utilities win over focus:not-sr-only, which resets position to static and padding to 0.
const skipLinkClass = [
  'sr-only focus:not-sr-only',
  // Sits just below the 64px header (+1px border) with an 8px gap, aligned to the
  // logo's gutter: 24px on mobile, the 1040px container's 32px padding from md up.
  'focus:fixed! focus:top-[73px] focus:left-6 md:focus:left-[max(2rem,calc((100vw_-_1040px)/2_+_2rem))] focus:z-50 focus:m-0!',
  'focus:inline-flex focus:h-auto! focus:w-auto! focus:min-h-10 focus:items-center',
  'focus:overflow-visible! focus:px-4! focus:whitespace-nowrap focus:[clip-path:none]!',
  'focus:rounded-[8px] focus:bg-[#0F5C63] focus:text-[14px] focus:font-medium focus:text-white focus:no-underline',
  'focus-visible:outline-2! focus-visible:outline-solid! focus-visible:outline-offset-2! focus-visible:outline-[#16181D]!',
].join(' ')

export function ClauseShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${newsreader.variable} ${geist.variable} ${geistMono.variable} min-h-screen bg-[#F7F7F5] text-[#16181D] font-[family-name:var(--f-ui)]`}>
      <a href="#main" className={skipLinkClass}>
        Skip to content
      </a>
      <header className="border-b border-[#16181D]/10">
        <div className="mx-auto max-w-[1040px] px-6 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--f-display)] text-[20px] tracking-[-0.01em]">PrivacyPage</Link>
          <nav className="flex items-center gap-6 text-[14px]">
            <Link href="/for" className="hidden sm:inline text-[#16181D]/70 hover:text-[#16181D]">Platforms</Link>
            <Link href="/pricing" className="hidden sm:inline text-[#16181D]/70 hover:text-[#16181D]">Pricing</Link>
            <Link href="/#generate" className="inline-flex items-center h-10 px-4 rounded-[8px] bg-[#0F5C63] text-white font-medium hover:bg-[#0B4A50]">Generate free</Link>
          </nav>
        </div>
      </header>
      <div id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </div>
      <ClauseFooter />
    </div>
  )
}
