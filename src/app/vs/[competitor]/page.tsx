import { PRICE, PRICING } from '@/lib/currency'
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

      <article className="max-w-[820px] mx-auto break-words">
        <header className="mb-16">
          <p className="font-mono text-[14px] text-seal mb-6">Comparison · 2026</p>
          <h1 className="font-display text-[40px] md:text-[48px] leading-[1.1] tracking-[-0.02em] mb-6 break-words">{page.h1}</h1>
          <p className="font-doc text-[20px] leading-[1.6] text-ink/80">{page.tagline}</p>
        </header>

        <div className="space-y-6 mb-10">
          {page.intro.map((para, i) => (
            <p
              key={i}
              className="font-doc text-[18px] leading-[1.6] text-ink/90 [&_a]:text-seal [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-seal/40 [&_strong]:font-medium [&_strong]:text-ink [&_em]:text-ink/70"
              dangerouslySetInnerHTML={{ __html: para }}
            />
          ))}
        </div>

        {page.callout && (
          <div className="rounded-[8px] border border-ink/10 bg-white p-6 mb-16">
            <p className="font-doc text-[16px] leading-[1.6] text-ink/85 mb-4">{page.callout.text}</p>
            <Link href={page.callout.href} className="inline-flex items-center min-h-11 text-[14px] font-medium text-seal underline underline-offset-4 decoration-seal/40 hover:decoration-seal">
              {page.callout.linkLabel} →
            </Link>
          </div>
        )}

        <section className="mb-4">
          <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-8">{page.name} vs PrivacyPage at a glance</h2>
          <div data-fixed-price>
            <div className="md:hidden space-y-4">
              {page.comparisonRows.map((row) => (
                <div key={row.label} className="rounded-[8px] border border-ink/10 bg-white overflow-hidden">
                  <p className="px-4 pt-4 font-medium text-ink">{row.label}</p>
                  <p className="px-4 py-3 text-[14px] leading-[1.5] text-ink/70">
                    <span className="block text-[12px] uppercase tracking-[0.08em] text-ink/50 mb-1">{page.name}</span>
                    {row.them}
                  </p>
                  <p className="px-4 py-3 text-[14px] leading-[1.5] text-ink bg-seal-tint/60">
                    <span className="block text-[12px] uppercase tracking-[0.08em] text-seal mb-1">PrivacyPage</span>
                    {row.us}
                  </p>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto rounded-[8px] border border-ink/10 bg-white">
              <table className="w-full text-left font-ui text-[14px] leading-[1.5]">
                <thead>
                  <tr className="border-b border-ink/10">
                    <th className="p-4 font-medium text-ink/60 w-[28%]"></th>
                    <th className="p-4 font-medium text-ink/60">{page.name}</th>
                    <th className="p-4 font-medium text-seal bg-seal-tint">PrivacyPage</th>
                  </tr>
                </thead>
                <tbody>
                  {page.comparisonRows.map((row) => (
                    <tr key={row.label} className="border-t border-ink/10 align-top">
                      <td className="p-4 font-medium text-ink">{row.label}</td>
                      <td className="p-4 text-ink/70">{row.them}</td>
                      <td className="p-4 text-ink bg-seal-tint/50">{row.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p data-fixed-price className="mt-4 text-[14px] leading-[1.5] text-ink/70">
            Visitors in India pay ₹{PRICING.INR.single.toLocaleString('en-IN')} per document (₹{PRICING.INR.bundle.toLocaleString('en-IN')} bundle) at checkout.
          </p>
        </section>
        <p className="mt-4 mb-16 text-[12px] leading-[1.5] text-ink/50">{page.pricingSourceNote}</p>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-[24px] leading-[1.3] mb-6">Where {page.name} is stronger</h2>
              <div className="space-y-4">
                {page.prosThem.map((p) => (
                  <div key={p.title} className="rounded-[8px] border border-ink/10 bg-white p-4 md:p-6">
                    <h3 className="font-display text-[18px] leading-[1.3] mb-2">{p.title}</h3>
                    <p className="text-[14px] leading-[1.5] text-ink/70">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display text-[24px] leading-[1.3] mb-6">Where PrivacyPage wins</h2>
              <div className="space-y-4">
                {page.prosUs.map((p) => (
                  <div key={p.title} className="rounded-[8px] border border-ink/10 bg-seal-tint/60 p-4 md:p-6">
                    <h3 className="font-display text-[18px] leading-[1.3] mb-2">{p.title}</h3>
                    <p className="text-[14px] leading-[1.5] text-ink/70">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-6">The honest verdict</h2>
          <div className="space-y-6">
            {page.verdict.map((para, i) => (
              <p
                key={i}
                className="font-doc text-[18px] leading-[1.6] text-ink/90 [&_strong]:font-medium [&_strong]:text-ink"
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}
          </div>
        </section>

        <SeoCtaCard
          heading={`Skip the subscription. Pay ${PRICE.single} once.`}
          sub="Generate your document free right now — see the full preview before paying a cent."
        />

        <SeoFaqSection faqs={page.faqs} />

        <SeoRelatedLinks heading="Related reading" links={page.relatedBlog} />

        <div className="mt-16 border-t border-ink/10 pt-16">
          <h2 className="font-display text-[24px] leading-[1.3] mb-6">More comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {otherCompetitors.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="inline-flex items-center min-h-11 max-w-full px-4 rounded-full border border-ink/10 bg-white text-[14px] text-ink/70 hover:border-seal/40 hover:text-ink"
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
