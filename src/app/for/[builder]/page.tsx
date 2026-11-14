import { PRICE } from '@/lib/currency'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { builderPages, getBuilderPage, buildFaqSchema } from '@/lib/seo-pages'
import { platformPages, getPlatformPage } from '@/lib/platforms'
import { PlatformPageView } from '@/components/PlatformPageView'
import { SeoPageShell, SeoCtaCard, SeoFaqSection, SeoRelatedLinks } from '@/components/SeoPageShell'

export function generateStaticParams() {
  return [...builderPages, ...platformPages].map((p) => ({ builder: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ builder: string }> }): Promise<Metadata> {
  const { builder } = await params
  const platform = getPlatformPage(builder)
  if (platform) {
    const url = `https://privacypage.io/for/${platform.slug}`
    return {
      title: platform.metaTitle,
      description: platform.metaDescription,
      alternates: { canonical: url },
      openGraph: { title: platform.metaTitle, description: platform.metaDescription, url, siteName: 'PrivacyPage', type: 'article' },
    }
  }
  const page = getBuilderPage(builder)
  if (!page) return {}
  const url = `https://privacypage.io/for/${page.slug}`
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: [page.keyword, `${page.name.toLowerCase()} privacy policy`, 'privacy policy generator', 'app legal documents'],
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

export default async function BuilderLandingPage({ params }: { params: Promise<{ builder: string }> }) {
  const { builder } = await params
  const platform = getPlatformPage(builder)
  if (platform) return <PlatformPageView page={platform} />
  const page = getBuilderPage(builder)
  if (!page) notFound()

  const otherBuilders = builderPages.filter((p) => p.slug !== page.slug)
  const faqSchema = buildFaqSchema(page.faqs)

  return (
    <SeoPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="max-w-[760px] mx-auto break-words">
        <header className="mb-16">
          <p className="font-mono text-[14px] text-seal mb-6">For {page.name} builders</p>
          <h1 className="font-display text-[40px] md:text-[48px] leading-[1.1] tracking-[-0.02em] mb-6 break-words">{page.h1}</h1>
          <p className="font-doc text-[20px] leading-[1.6] text-ink/80">{page.tagline}</p>
        </header>

        <div className="space-y-6 mb-16">
          {page.intro.map((para, i) => (
            <p
              key={i}
              className="font-doc text-[18px] leading-[1.6] text-ink/90 [&_a]:text-seal [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-seal/40 [&_strong]:font-medium [&_strong]:text-ink"
              dangerouslySetInnerHTML={{ __html: para }}
            />
          ))}
        </div>

        <section className="mb-16">
          <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-8">{page.dataHeading}</h2>
          <div className="space-y-4">
            {page.dataPoints.map((d) => (
              <div key={d.title} className="rounded-[8px] border border-ink/10 bg-white p-6">
                <h3 className="font-display text-[18px] leading-[1.3] mb-2">{d.title}</h3>
                <p className="text-[14px] leading-[1.5] text-ink/70">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-6">{page.requirementsHeading}</h2>
          <div className="space-y-6">
            {page.requirements.map((para, i) => (
              <p
                key={i}
                className="font-doc text-[18px] leading-[1.6] text-ink/90 [&_a]:text-seal [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-seal/40 [&_strong]:font-medium [&_strong]:text-ink"
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}
          </div>
        </section>

        <section className="mb-4">
          <h2 className="font-display text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-8">How the 60-second generator works</h2>
          <ol className="space-y-4 mb-8">
            {[
              'Pick a document type — privacy policy, terms of service, EULA, cookie policy, or disclaimer.',
              `Answer about ten plain-English questions: your app's name, what data it collects, and which third-party services it uses.`,
              'Preview the complete generated document — free, no account, nothing blurred that matters for judging it.',
              `Pay ${PRICE.single} once to unlock and export as HTML, Markdown, or plain text. Regenerate free, forever, when your app changes.`,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4 font-doc text-[18px] leading-[1.6] text-ink/90">
                <span className="w-8 h-8 rounded-full bg-seal-tint text-seal font-mono text-[13px] flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-[8px] border border-ink/10 bg-seal-tint/50 p-6">
            <p className="font-doc text-[16px] leading-[1.6] text-ink/85">
              <span className="font-ui font-medium text-seal">Hosting tip for {page.name}: </span>
              {page.hostingTip}
            </p>
          </div>
        </section>

        <SeoCtaCard heading={`Generate the privacy policy for your ${page.name} app`} />

        <SeoFaqSection faqs={page.faqs} />

        <SeoRelatedLinks
          heading="Guides for shipping your app"
          links={[
            ...page.relatedBlog,
            { href: '/compliance/gdpr', label: 'GDPR Privacy Policy Requirements, in Plain English' },
            { href: '/compliance/dpdp', label: "India's DPDP Act: Privacy Policy Requirements Explained" },
          ]}
        />

        <div className="mt-16 border-t border-ink/10 pt-16">
          <h2 className="font-display text-[24px] leading-[1.3] mb-6">Building with a different tool?</h2>
          <div className="flex flex-wrap gap-2">
            {otherBuilders.map((b) => (
              <Link
                key={b.slug}
                href={`/for/${b.slug}`}
                className="inline-flex items-center min-h-11 max-w-full px-4 rounded-full border border-ink/10 bg-white text-[14px] text-ink/70 hover:border-seal/40 hover:text-ink"
              >
                {b.name} apps →
              </Link>
            ))}
          </div>
        </div>
      </article>
    </SeoPageShell>
  )
}
