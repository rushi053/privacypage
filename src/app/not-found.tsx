import type { Metadata } from 'next'
import Link from 'next/link'
import { ClauseShell } from '@/components/ClauseShell'

export const metadata: Metadata = {
  title: 'Page not found — PrivacyPage',
}

const links: [string, string][] = [
  ['/for', 'Platforms'],
  ['/pricing', 'Pricing'],
  ['/guides/app-rejected-privacy-policy', 'Fix a rejection'],
]

export default function NotFound() {
  return (
    <ClauseShell>
      <main className="mx-auto max-w-[1040px] px-6 md:px-8 pt-16 md:pt-24 pb-24">
        <p className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mb-6">404</p>
        <h1 className="font-[family-name:var(--f-display)] text-[40px] md:text-[56px] leading-[1.1] tracking-[-0.02em] mb-8">
          Page not found
        </h1>
        <p className="font-[family-name:var(--f-doc)] text-[20px] leading-[1.6] text-[#16181D]/85 max-w-[640px] mb-8">
          That URL isn’t on PrivacyPage. Generate a privacy policy, or pick a platform guide.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/#generate"
            className="inline-flex items-center justify-center h-12 px-6 rounded-[8px] bg-[#0F5C63] text-white text-[16px] font-medium hover:bg-[#0B4A50]"
          >
            Generate free
          </Link>
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center h-12 px-4 text-[16px] text-[#16181D]/70 hover:text-[#16181D]"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/"
            className="inline-flex items-center h-12 px-4 text-[16px] text-[#16181D] underline underline-offset-4 decoration-[#16181D]/30 hover:decoration-[#16181D]"
          >
            Home
          </Link>
        </div>
      </main>
    </ClauseShell>
  )
}
