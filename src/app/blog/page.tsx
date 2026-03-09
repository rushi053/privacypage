import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Logo } from '@/components/Logo'

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

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-gray-900">PrivacyPage</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-gray-900 font-medium">Blog</Link>
            <Link href="/#generate" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">Generate Free</Link>
          </div>
        </div>
      </nav>

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

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-center text-gray-900">Blog</h1>
          <p className="text-gray-600 text-center mb-16 max-w-xl mx-auto">Guides and tips on privacy policies, GDPR compliance, and app store requirements.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-card rounded-2xl p-6 hover:border-indigo-600 transition-all group">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors">{post.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.description}</p>
                
                {/* Category tags from keywords */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.keywords.slice(0, 3).map((keyword) => {
                    // Extract simple tags from keywords
                    let tag = keyword;
                    if (keyword.toLowerCase().includes('ios')) tag = 'iOS';
                    else if (keyword.toLowerCase().includes('android')) tag = 'Android';
                    else if (keyword.toLowerCase().includes('gdpr')) tag = 'GDPR';
                    else if (keyword.toLowerCase().includes('ccpa')) tag = 'CCPA';
                    else if (keyword.toLowerCase().includes('shopify')) tag = 'Shopify';
                    else if (keyword.toLowerCase().includes('wordpress')) tag = 'WordPress';
                    else if (keyword.toLowerCase().includes('app store')) tag = 'App Store';
                    else if (keyword.toLowerCase().includes('play store')) tag = 'Play Store';
                    else return null;
                    
                    return (
                      <span key={keyword} className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                        {tag}
                      </span>
                    );
                  })}
                </div>

                <span className="text-sm text-indigo-600 font-medium flex items-center gap-2">
                  Read more
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-6 text-center text-gray-500 text-sm bg-gray-50">
        © {new Date().getFullYear()} PrivacyPage. All rights reserved.
      </footer>
    </div>
  )
}
