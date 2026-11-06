import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { PriceLocalizer } from '@/components/PriceLocalizer'
import { ArrowLeftIcon } from '@/components/ClauseIcons'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} — PrivacyPage Blog`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://privacypage.io/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://privacypage.io/blog/${post.slug}`,
      siteName: 'PrivacyPage',
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

const articleBodyClass = [
  'font-[family-name:var(--f-doc)] text-[17px] md:text-[18px] leading-[1.6] text-[#16181D]/90',
  '[&_h2]:font-[family-name:var(--f-display)] [&_h2]:text-[28px] [&_h2]:leading-[1.2] [&_h2]:tracking-[-0.01em] [&_h2]:text-[#16181D] [&_h2]:font-medium [&_h2]:mt-12 [&_h2]:mb-4',
  '[&_h3]:font-[family-name:var(--f-display)] [&_h3]:text-[22px] [&_h3]:leading-[1.3] [&_h3]:text-[#16181D] [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-3',
  '[&_p]:mb-4 [&_p]:leading-[1.6]',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2',
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2',
  '[&_li]:leading-[1.6]',
  '[&_strong]:text-[#16181D] [&_strong]:font-semibold',
  '[&_a]:text-[#0F5C63] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[#0F5C63]/40 hover:[&_a]:decoration-[#0F5C63]',
  '[&_code]:font-[family-name:var(--f-mono)] [&_code]:text-[0.85em] [&_code]:bg-[#E6F0F0] [&_code]:text-[#0F5C63] [&_code]:px-2 [&_code]:rounded-[4px]',
  '[&_em]:italic',
  '[&_table]:my-8 [&_table]:w-full [&_table]:font-[family-name:var(--f-ui)] [&_table]:text-[15px] [&_table]:leading-[1.5]',
].join(' ')

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const allPosts = getAllPosts().filter(p => p.slug !== slug).slice(0, 2)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'PrivacyPage' },
    publisher: { '@type': 'Organization', name: 'PrivacyPage', url: 'https://privacypage.io' },
  }

  // Parse FAQ sections from post content for FAQPage schema
  const faqSchema = (() => {
    const faqEntries: { question: string; answer: string }[] = []
    const content = post.content
    // Find the FAQ section
    const faqSectionMatch = content.match(/<h2>FAQ<\/h2>([\s\S]*?)(?=<h2|$)/i)
    if (faqSectionMatch) {
      const faqSection = faqSectionMatch[1]
      let match
      const faqH3Regex = /<h3>(.*?)<\/h3>\s*([\s\S]*?)(?=<h3|$)/gi
      while ((match = faqH3Regex.exec(faqSection)) !== null) {
        const question = match[1].replace(/<[^>]*>/g, '').trim()
        const answer = match[2].replace(/<[^>]*>/g, '').trim()
        if (question && answer) {
          faqEntries.push({ question, answer })
        }
      }
    }
    if (faqEntries.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntries.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }
  })()

  return (
    <article className="mx-auto max-w-[820px] px-6 md:px-8 pt-16 md:pt-24 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <PriceLocalizer />

      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[8px] border border-[#16181D]/10 bg-white p-6">
        <p className="text-[16px] leading-[1.5]">
          <span className="font-medium">Need a privacy policy?</span> Generate one for free in 60 seconds.
        </p>
        <Link href="/#generate" className="inline-flex items-center justify-center h-12 px-6 rounded-[8px] bg-[#0F5C63] text-white text-[16px] font-medium hover:bg-[#0B4A50] shrink-0">
          Generate Free
        </Link>
      </div>

      <Link href="/blog" className="inline-flex items-center gap-2 min-h-11 text-[14px] text-[#16181D]/70 hover:text-[#16181D] mb-8">
        <ArrowLeftIcon />
        Back to Blog
      </Link>

      <header className="mb-12">
        <h1 className="font-[family-name:var(--f-display)] text-[36px] sm:text-[44px] leading-[1.1] tracking-[-0.02em] mb-6">{post.title}</h1>
        <p className="font-[family-name:var(--f-mono)] text-[13px] text-[#16181D]/55">
          <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
          <span> · </span>
          <span>{post.readTime}</span>
        </p>
      </header>

      <div className={articleBodyClass} dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="mt-16 rounded-[8px] border border-[#16181D]/10 bg-white p-6 md:p-8 text-center">
        <h2 className="font-[family-name:var(--f-display)] text-[28px] leading-[1.2] mb-3">Generate your privacy policy in 60 seconds</h2>
        <p className="font-[family-name:var(--f-doc)] text-[18px] leading-[1.6] text-[#16181D]/80 mb-6">Professional, legally compliant documents for your app — free to preview.</p>
        <Link href="/#generate" className="inline-flex items-center justify-center h-12 px-6 rounded-[8px] bg-[#0F5C63] text-white text-[16px] font-medium hover:bg-[#0B4A50]">
          Generate Now →
        </Link>
      </div>

      {allPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="font-[family-name:var(--f-display)] text-[24px] leading-[1.3] mb-6">Related Articles</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allPosts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group block h-full rounded-[8px] border border-[#16181D]/10 bg-white p-6 hover:border-[#0F5C63]/40">
                  <p className="font-[family-name:var(--f-mono)] text-[12px] text-[#16181D]/55 mb-2">{p.readTime}</p>
                  <h3 className="font-[family-name:var(--f-display)] text-[18px] leading-[1.3] group-hover:text-[#0F5C63]">{p.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
