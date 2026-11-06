import { PRICE } from '@/lib/currency'
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

      <article className="max-w-[760px] mx-auto break-words">
        <header className="mb-8">
          <p className="font-mono text-[14px] text-seal mb-6">{page.fullName}</p>
          <h1 className="font-display text-[40px] md:text-[48px] leading-[1.1] tracking-[-0.02em] mb-6 break-words">{page.h1}</h1>
          <p className="font-doc text-[20px] leading-[1.6] text-ink/80">{page.tagline}</p>
        </header>

        <div className="rounded-[8px] border border-attention/30 bg-attention/5 px-6 py-4 mb-16">
          <p className="text-[13px] leading-[1.6] text-attention">
            <strong>Not legal advice.</strong> This guide is a plain-English summary for developers, not a substitute
            for advice from a qualified lawyer. For high-risk or regulated processing, get a professional review.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-6">What {page.name === 'DPDP Act' ? 'the DPDP Act' : page.name} requires of your privacy policy</h2>
          <div className="space-y-6">
            {page.intro.map((para, i) => (
              <p
                key={i}
                className="font-doc text-[18px] leading-[1.6] text-ink/90 [&_a]:text-seal [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-seal/40 [&_strong]:font-medium [&_strong]:text-ink [&_em]:text-ink/70"
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-8">{page.checklistHeading}</h2>
          <ul className="space-y-4">
            {page.checklist.map((item) => (
              <li key={item} className="flex items-start gap-4 font-doc text-[18px] leading-[1.6] text-ink/90">
                <svg className="w-4 h-4 text-seal shrink-0 mt-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-8">How PrivacyPage covers {page.name === 'DPDP Act' ? 'the DPDP Act' : page.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {page.coverage.map((c) => (
              <div key={c.title} className="rounded-[8px] border border-ink/10 bg-white p-6">
                <h3 className="font-display text-[18px] leading-[1.3] mb-2">{c.title}</h3>
                <p className="text-[14px] leading-[1.5] text-ink/70">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <SeoCtaCard
          heading={`Generate a ${page.name}-ready privacy policy`}
          sub={`Answer ~10 questions about your app. Preview the full document free — pay ${PRICE.single} once only to unlock it.`}
        />

        <SeoFaqSection faqs={page.faqs} />

        <SeoRelatedLinks heading="Related reading" links={page.relatedBlog} />

        <div className="mt-16 border-t border-ink/10 pt-16">
          <h2 className="font-display text-[24px] leading-[1.3] mb-6">Other regulations</h2>
          <div className="flex flex-wrap gap-2">
            {otherRegulations.map((r) => (
              <Link
                key={r.slug}
                href={`/compliance/${r.slug}`}
                className="inline-flex items-center min-h-11 max-w-full px-4 rounded-full border border-ink/10 bg-white text-[14px] text-ink/70 hover:border-seal/40 hover:text-ink"
              >
                {r.name} requirements →
              </Link>
            ))}
            <Link
              href="/for/lovable"
              className="inline-flex items-center min-h-11 max-w-full px-4 rounded-full border border-ink/10 bg-white text-[14px] text-ink/70 hover:border-seal/40 hover:text-ink"
            >
              Built with an AI app builder? →
            </Link>
          </div>
        </div>
      </article>
    </SeoPageShell>
  )
}
