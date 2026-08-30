import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { regulationPages, getRegulationPage, buildFaqSchema } from '@/lib/seo-pages'
import { SeoPageShell, SeoCtaCard, SeoFaqSection, SeoRelatedLinks } from '@/components/SeoPageShell'

export function generateStaticParams() {
  return regulationPages.map((p) => ({ regulation: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ regulation: string }> }): Promise<Metadata> {
  const { regulation } = await params
  const page = getRegulationPage(regulation)
  if (!page) return {}
  const url = `https://privacypage.io/compliance/${page.slug}`
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: [page.keyword, `${page.name.toLowerCase()} compliance`, `${page.name.toLowerCase()} privacy policy generator`, 'privacy policy requirements'],
    alternates: { canonical: url },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url,
      siteName: 'PrivacyPage',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
    },
  }
}

export default async function RegulationGuidePage({ params }: { params: Promise<{ regulation: string }> }) {
  const { regulation } = await params
  const page = getRegulationPage(regulation)
  if (!page) notFound()

  const otherRegulations = regulationPages.filter((p) => p.slug !== page.slug)
  const faqSchema = buildFaqSchema(page.faqs)

  return (
    <SeoPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="max-w-[760px] mx-auto">
        <header className="mb-8">
          <p className="text-sm font-medium text-indigo-600 mb-3">{page.fullName}</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-gray-900">{page.h1}</h1>
          <p className="text-lg text-gray-500 leading-relaxed">{page.tagline}</p>
        </header>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-10">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Not legal advice.</strong> This guide is a plain-English summary for developers, not a substitute
            for advice from a qualified lawyer. For high-risk or regulated processing, get a professional review.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5 text-gray-900">What {page.name === 'DPDP Act' ? 'the DPDP Act' : page.name} requires of your privacy policy</h2>
          <div className="space-y-4">
            {page.intro.map((para, i) => (
              <p
                key={i}
                className="text-gray-700 leading-relaxed [&_a]:text-indigo-600 [&_a]:underline [&_a:hover]:text-indigo-700 [&_strong]:text-gray-900 [&_em]:text-gray-600"
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">{page.checklistHeading}</h2>
          <ul className="space-y-2.5">
            {page.checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">How PrivacyPage covers {page.name === 'DPDP Act' ? 'the DPDP Act' : page.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {page.coverage.map((c) => (
              <div key={c.title} className="border border-gray-100 rounded-xl p-5 bg-white hover:border-gray-200 transition-colors">
                <h3 className="font-semibold text-sm text-gray-900 mb-1.5">{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <SeoCtaCard
          heading={`Generate a ${page.name}-ready privacy policy`}
          sub="Answer ~10 questions about your app. Preview the full document free — pay $9.99 once only to unlock it."
        />

        <SeoFaqSection faqs={page.faqs} />

        <SeoRelatedLinks heading="Related reading" links={page.relatedBlog} />

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Other regulations</h2>
          <div className="flex flex-wrap gap-2">
            {otherRegulations.map((r) => (
              <Link
                key={r.slug}
                href={`/compliance/${r.slug}`}
                className="text-sm border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 text-gray-600 px-4 py-2 rounded-full transition-colors"
              >
                {r.name} requirements →
              </Link>
            ))}
            <Link
              href="/for/lovable"
              className="text-sm border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 text-gray-600 px-4 py-2 rounded-full transition-colors"
            >
              Built with an AI app builder? →
            </Link>
          </div>
        </div>
      </article>
    </SeoPageShell>
  )
}
