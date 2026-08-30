import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { competitorPages, getCompetitorPage, buildFaqSchema } from '@/lib/seo-pages'
import { SeoPageShell, SeoCtaCard, SeoFaqSection, SeoRelatedLinks } from '@/components/SeoPageShell'

export function generateStaticParams() {
  return competitorPages.map((p) => ({ competitor: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const { competitor } = await params
  const page = getCompetitorPage(competitor)
  if (!page) return {}
  const url = `https://privacypage.io/vs/${page.slug}`
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: [page.keyword, `${page.name.toLowerCase()} vs privacypage`, `${page.name.toLowerCase()} pricing`, 'privacy policy generator one-time payment'],
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

export default async function CompetitorComparisonPage({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor } = await params
  const page = getCompetitorPage(competitor)
  if (!page) notFound()

  const otherCompetitors = competitorPages.filter((p) => p.slug !== page.slug)
  const faqSchema = buildFaqSchema(page.faqs)

  return (
    <SeoPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="max-w-[820px] mx-auto">
        <header className="mb-10">
          <p className="text-sm font-medium text-indigo-600 mb-3">Comparison · 2026</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-gray-900">{page.h1}</h1>
          <p className="text-lg text-gray-500 leading-relaxed">{page.tagline}</p>
        </header>

        <div className="space-y-4 mb-10">
          {page.intro.map((para, i) => (
            <p
              key={i}
              className="text-gray-700 leading-relaxed [&_a]:text-indigo-600 [&_a]:underline [&_a:hover]:text-indigo-700 [&_strong]:text-gray-900 [&_em]:text-gray-600"
              dangerouslySetInnerHTML={{ __html: para }}
            />
          ))}
        </div>

        {page.callout && (
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 mb-10">
            <p className="text-sm text-gray-700 leading-relaxed mb-2">{page.callout.text}</p>
            <Link href={page.callout.href} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              {page.callout.linkLabel} →
            </Link>
          </div>
        )}

        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">{page.name} vs PrivacyPage at a glance</h2>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-900 px-4 py-3 w-1/4"></th>
                  <th className="text-left font-semibold text-gray-900 px-4 py-3">{page.name}</th>
                  <th className="text-left font-semibold text-indigo-700 px-4 py-3 bg-indigo-50/50">PrivacyPage</th>
                </tr>
              </thead>
              <tbody>
                {page.comparisonRows.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900 align-top">{row.label}</td>
                    <td className="px-4 py-3 text-gray-600 align-top leading-relaxed">{row.them}</td>
                    <td className="px-4 py-3 text-gray-700 align-top leading-relaxed bg-indigo-50/30">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="text-xs text-gray-400 mb-12 leading-relaxed">{page.pricingSourceNote}</p>

        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Where {page.name} is stronger</h2>
              <div className="space-y-3">
                {page.prosThem.map((p) => (
                  <div key={p.title} className="border border-gray-100 rounded-xl p-4 bg-white">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Where PrivacyPage wins</h2>
              <div className="space-y-3">
                {page.prosUs.map((p) => (
                  <div key={p.title} className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/30">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-5 text-gray-900">The honest verdict</h2>
          <div className="space-y-4">
            {page.verdict.map((para, i) => (
              <p
                key={i}
                className="text-gray-700 leading-relaxed [&_strong]:text-gray-900"
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}
          </div>
        </section>

        <SeoCtaCard
          heading="Skip the subscription. Pay $9.99 once."
          sub="Generate your document free right now — see the full preview before paying a cent."
        />

        <SeoFaqSection faqs={page.faqs} />

        <SeoRelatedLinks heading="Related reading" links={page.relatedBlog} />

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 text-gray-900">More comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {otherCompetitors.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="text-sm border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 text-gray-600 px-4 py-2 rounded-full transition-colors"
              >
                vs {c.name} →
              </Link>
            ))}
          </div>
        </div>
      </article>
    </SeoPageShell>
  )
}
