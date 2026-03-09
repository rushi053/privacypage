import { getAllPosts, getPostBySlug } from '@/lib/blog'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Logo } from '@/components/Logo'

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
    const h3Regex = /<h3>(.*?)<\/h3>\s*([\s\S]*?)(?=<h[23]|<h2|$)/gi
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
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

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

      <article className="pt-40 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8 inline-flex items-center gap-2">
            ← Back to Blog
          </Link>

          <header className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-gray-900">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          <div
            className="prose prose-gray max-w-none
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-gray-900
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-gray-900
              [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2
              [&_li]:text-gray-700
              [&_strong]:text-gray-900
              [&_a]:text-indigo-600 [&_a]:hover:text-indigo-700 [&_a]:underline
              [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-indigo-600
              [&_em]:text-gray-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA */}
          <div className="mt-16 glass-card rounded-2xl p-8 text-center border-indigo-600">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Generate your privacy policy in 60 seconds</h3>
            <p className="text-gray-600 mb-6">Professional, legally compliant documents for your app — free to preview.</p>
            <Link href="/#generate" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105">
              Generate Now →
            </Link>
          </div>

          {/* Related Posts */}
          {allPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allPosts.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="glass-card rounded-xl p-5 hover:border-indigo-600 transition-all group">
                    <div className="text-xs text-gray-500 mb-2">{p.readTime}</div>
                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">{p.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <footer className="border-t border-gray-200 py-8 px-6 text-center text-gray-500 text-sm bg-gray-50">
        © {new Date().getFullYear()} PrivacyPage. All rights reserved.
      </footer>
    </div>
  )
}
