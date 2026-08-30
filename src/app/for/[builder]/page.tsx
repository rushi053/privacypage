import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { builderPages, getBuilderPage, buildFaqSchema } from '@/lib/seo-pages'
import { SeoPageShell, SeoCtaCard, SeoFaqSection, SeoRelatedLinks } from '@/components/SeoPageShell'

export function generateStaticParams() {
  return builderPages.map((p) => ({ builder: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ builder: string }> }): Promise<Metadata> {
  const { builder } = await params
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
  const page = getBuilderPage(builder)
  if (!page) notFound()

  const otherBuilders = builderPages.filter((p) => p.slug !== page.slug)
  const faqSchema = buildFaqSchema(page.faqs)

  return (
    <SeoPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="max-w-[760px] mx-auto">
        <header className="mb-10">
          <p className="text-sm font-medium text-indigo-600 mb-3">For {page.name} builders</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-gray-900">{page.h1}</h1>
          <p className="text-lg text-gray-500 leading-relaxed">{page.tagline}</p>
        </header>

        <div className="space-y-4 mb-12">
          {page.intro.map((para, i) => (
            <p
              key={i}
              className="text-gray-700 leading-relaxed [&_a]:text-indigo-600 [&_a]:underline [&_a:hover]:text-indigo-700 [&_strong]:text-gray-900"
              dangerouslySetInnerHTML={{ __html: para }}
            />
          ))}
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">{page.dataHeading}</h2>
          <div className="space-y-3">
            {page.dataPoints.map((d) => (
              <div key={d.title} className="border border-gray-100 rounded-xl p-5 bg-white hover:border-gray-200 transition-colors">
                <h3 className="font-semibold text-sm text-gray-900 mb-1.5">{d.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5 text-gray-900">{page.requirementsHeading}</h2>
          <div className="space-y-4">
            {page.requirements.map((para, i) => (
              <p
                key={i}
                className="text-gray-700 leading-relaxed [&_a]:text-indigo-600 [&_a]:underline [&_a:hover]:text-indigo-700 [&_strong]:text-gray-900"
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5 text-gray-900">How the 60-second generator works</h2>
          <ol className="space-y-3 mb-6">
            {[
              'Pick a document type — privacy policy, terms of service, EULA, cookie policy, or disclaimer.',
              `Answer about ten plain-English questions: your app's name, what data it collects, and which third-party services it uses.`,
              'Preview the complete generated document — free, no account, nothing blurred that matters for judging it.',
              'Pay $9.99 once to unlock and export as HTML, Markdown, or plain text. Regenerate free, forever, when your app changes.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-indigo-700">Hosting tip for {page.name}: </span>
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

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Building with a different tool?</h2>
          <div className="flex flex-wrap gap-2">
            {otherBuilders.map((b) => (
              <Link
                key={b.slug}
                href={`/for/${b.slug}`}
                className="text-sm border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 text-gray-600 px-4 py-2 rounded-full transition-colors"
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
