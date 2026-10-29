import Link from 'next/link'
import type { Metadata } from 'next'
import { platformPages } from '@/lib/platforms'
import { builderPages } from '@/lib/seo-pages'
import { ClauseShell } from '@/components/ClauseShell'

export const metadata: Metadata = {
  title: 'Privacy Policy by Platform — App Stores, Extensions, Bots & SDKs | PrivacyPage',
  description: 'What each platform requires from your privacy policy — App Store, Google Play, Chrome Web Store, Discord, SDKs like AdMob — with links to the official rules.',
  alternates: { canonical: 'https://privacypage.io/for' },
}

export default function PlatformHub() {
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: platformPages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://privacypage.io/for/${p.slug}`, name: p.h1 })),
  }
  return (
    <ClauseShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <main className="mx-auto max-w-[1040px] px-6 md:px-8 pt-16 md:pt-24 pb-16">
        <p className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mb-6">Platform guides</p>
        <h1 className="font-[family-name:var(--f-display)] text-[40px] md:text-[56px] leading-[1.1] tracking-[-0.02em] mb-8">Privacy policy by platform</h1>
        <p className="font-[family-name:var(--f-doc)] text-[20px] leading-[1.6] text-[#16181D]/85 max-w-[680px] mb-16">
          Each guide quotes the platform’s own policy, links the official source, and lists what common SDKs collect. Store rules change, so check the linked sources before you submit. Not legal advice.
        </p>
        <ul className="grid sm:grid-cols-2 gap-4 mb-16">
          {platformPages.map((p) => (
            <li key={p.slug}>
              <Link href={`/for/${p.slug}`} className="block h-full rounded-[8px] border border-[#16181D]/10 bg-white p-6 hover:border-[#0F5C63]/40">
                <p className="font-[family-name:var(--f-mono)] text-[12px] text-[#0F5C63] mb-2">{p.storeRule.store}</p>
                <p className="font-[family-name:var(--f-display)] text-[20px] leading-[1.3] mb-2">{p.h1}</p>
                <p className="text-[14px] leading-[1.5] text-[#16181D]/70">{p.metaDescription}</p>
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="font-[family-name:var(--f-display)] text-[24px] mb-6">AI app builders</h2>
        <ul className="flex flex-wrap gap-2">
          {builderPages.map((b) => (
            <li key={b.slug}><Link href={`/for/${b.slug}`} className="inline-flex items-center h-10 px-4 rounded-full border border-[#16181D]/10 bg-white text-[14px] hover:border-[#0F5C63]/40">{b.name} apps</Link></li>
          ))}
        </ul>
      </main>
    </ClauseShell>
  )
}
