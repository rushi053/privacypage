import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRightIcon } from '@/components/ClauseIcons'

export const metadata: Metadata = {
  title: 'Blog — PrivacyPage | Privacy Policy Tips & Guides',
  description: 'Learn about privacy policies, GDPR compliance, app store requirements, and more. Practical guides for developers and startups.',
  alternates: { canonical: 'https://privacypage.io/blog' },
  openGraph: {
    title: 'Blog — PrivacyPage',
    description: 'Privacy policy guides, GDPR tips, and app store compliance articles for developers.',
    url: 'https://privacypage.io/blog',
    siteName: 'PrivacyPage',
    type: 'website',
  },
}

function keywordTag(keyword: string): string | null {
  const value = keyword.toLowerCase()
  if (value.includes('ios')) return 'iOS'
  if (value.includes('android')) return 'Android'
  if (value.includes('gdpr')) return 'GDPR'
  if (value.includes('ccpa')) return 'CCPA'
  if (value.includes('shopify')) return 'Shopify'
  if (value.includes('wordpress')) return 'WordPress'
  if (value.includes('app store')) return 'App Store'
  if (value.includes('play store')) return 'Play Store'
  return null
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="mx-auto max-w-[1040px] px-6 md:px-8 pt-16 md:pt-24 pb-16">
      <p className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mb-6">Blog</p>
      <h1 className="font-[family-name:var(--f-display)] text-[40px] md:text-[56px] leading-[1.1] tracking-[-0.02em] mb-8">Blog</h1>
      <p className="font-[family-name:var(--f-doc)] text-[20px] leading-[1.6] text-[#16181D]/85 max-w-[640px] mb-8">
        Guides and tips on privacy policies, GDPR compliance, and app store requirements.
      </p>

      <div className="mb-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[8px] border border-[#16181D]/10 bg-white p-6">
        <p className="text-[16px] leading-[1.5]">
          <span className="font-medium">Need a privacy policy?</span> Generate one for free in 60 seconds.
        </p>
        <Link href="/#generate" className="inline-flex items-center justify-center h-12 px-6 rounded-[8px] bg-[#0F5C63] text-white text-[16px] font-medium hover:bg-[#0B4A50] shrink-0">
          Generate Free
        </Link>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => {
          const tags: { keyword: string; tag: string }[] = []
          const seen = new Set<string>()
          for (const keyword of post.keywords.slice(0, 3)) {
            const tag = keywordTag(keyword)
            if (!tag || seen.has(tag)) continue
            seen.add(tag)
            tags.push({ keyword, tag })
          }
          return (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col rounded-[8px] border border-[#16181D]/10 bg-white p-6 hover:border-[#0F5C63]/40">
                <p className="font-[family-name:var(--f-mono)] text-[12px] text-[#16181D]/55 mb-4">
                  <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                  <span> · </span>
                  <span>{post.readTime}</span>
                </p>
                <h2 className="font-[family-name:var(--f-display)] text-[22px] leading-[1.3] mb-3 group-hover:text-[#0F5C63]">{post.title}</h2>
                <p className="font-[family-name:var(--f-doc)] text-[16px] leading-[1.6] text-[#16181D]/75 mb-6">{post.description}</p>
                {tags.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mb-6">
                    {tags.map(({ keyword, tag }) => (
                      <li key={keyword} className="font-[family-name:var(--f-mono)] text-[12px] uppercase tracking-[0.06em] text-[#16181D]/60 border border-[#16181D]/10 rounded-[8px] px-2 py-2">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="mt-auto inline-flex items-center gap-2 min-h-11 text-[14px] text-[#0F5C63]">
                  Read more
                  <ArrowRightIcon />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
