import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import type { Metadata } from 'next'

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
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="font-semibold text-lg">PrivacyPage</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-white font-medium">Blog</Link>
            <Link href="/#generate" className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors">Generate Free</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-center">Blog</h1>
          <p className="text-zinc-400 text-center mb-16 max-w-xl mx-auto">Guides and tips on privacy policies, GDPR compliance, and app store requirements.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-card rounded-2xl p-6 hover:bg-zinc-800/60 hover:border-indigo-500/50 transition-all group">
                <div className="flex items-center gap-3 text-sm text-zinc-500 mb-4">
                  <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold mb-3 group-hover:text-indigo-400 transition-colors">{post.title}</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">{post.description}</p>
                <span className="text-sm text-indigo-400 font-medium flex items-center gap-2">
                  Read more
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800/50 py-8 px-6 text-center text-zinc-500 text-sm">
        © {new Date().getFullYear()} PrivacyPage. All rights reserved.
      </footer>
    </div>
  )
}
