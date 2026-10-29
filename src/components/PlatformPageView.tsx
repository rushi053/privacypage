import Link from 'next/link'
import { ClauseShell } from '@/components/ClauseShell'
import type { PlatformPage } from '@/lib/platforms'


// Palette (Clause): paper #F7F7F5, ink #16181D, seal teal #0F5C63. 8pt grid only.
function ExternalIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}

function Source({ href }: { href: string }) {
  const host = new URL(href).hostname.replace(/^www\./, '')
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-[family-name:var(--f-ui)] text-[14px] text-[#0F5C63] underline underline-offset-4 decoration-[#0F5C63]/40 hover:decoration-[#0F5C63]">
      Source: {host} <ExternalIcon />
    </a>
  )
}

function Clause({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid md:grid-cols-[72px_1fr] gap-x-8 gap-y-2 md:gap-y-8 py-16 border-t border-[#16181D]/10" aria-labelledby={`c-${n}`}>
      <div className="font-[family-name:var(--f-mono)] text-[14px] leading-8 text-[#0F5C63]">§ {n}</div>
      <div className="min-w-0">
        <h2 id={`c-${n}`} className="font-[family-name:var(--f-display)] text-[24px] md:text-[32px] leading-[1.25] tracking-[-0.01em] mb-8">{title}</h2>
        <div className="font-[family-name:var(--f-doc)] text-[18px] leading-[1.6] text-[#16181D]/90 space-y-6">{children}</div>
      </div>
    </section>
  )
}

export function PlatformPageView({ page }: { page: PlatformPage }) {
  const general = page.templateAvailability === 'general'
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return (
    <ClauseShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="mx-auto max-w-[1040px] px-6 md:px-8">
        <div className="pt-16 md:pt-24 pb-16 grid md:grid-cols-[1fr_320px] gap-16 items-start">
          <div>
            <p className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mb-6">{page.storeRule.store} · Platform guide</p>
            <h1 className="font-[family-name:var(--f-display)] text-[40px] md:text-[56px] leading-[1.1] tracking-[-0.02em] mb-8">{page.h1}</h1>
            <p className="font-[family-name:var(--f-doc)] text-[20px] leading-[1.6] text-[#16181D]/85 max-w-[640px]">{page.answer}</p>
          </div>
          <aside className="relative rounded-[8px] border border-[#16181D]/10 bg-white p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[8px] bg-[radial-gradient(120%_80%_at_100%_0%,rgba(15,92,99,0.08),transparent_60%)]" />
            <p className="relative text-[12px] uppercase tracking-[0.08em] text-[#16181D]/60 mb-2">Template</p>
            <p className="relative text-[16px] leading-[1.5] mb-6">
              {general
                ? <>Uses our <strong>general app policy</strong>. There is no {page.name}-specific template; you describe your {page.name.toLowerCase()} in the wizard.</>
                : <>Dedicated <strong>{page.templateAvailability === 'ios' ? 'iOS' : 'Android'}</strong> template — pick “{page.templateAvailability === 'ios' ? 'iOS' : 'Android'}” as the platform in the wizard.</>}
            </p>
            <Link href="/#generate" className="relative flex items-center justify-center h-12 rounded-[8px] bg-[#0F5C63] text-white text-[16px] font-medium hover:bg-[#0B4A50]">Preview your policy free</Link>
            <p className="relative mt-4 text-[12px] leading-[1.5] text-[#16181D]/60">Not legal advice. Store rules change; check the linked sources before you submit.</p>
          </aside>
        </div>

        <Clause n="1" title={`What ${page.storeRule.store} requires`}>
          <p className="text-[14px] font-[family-name:var(--f-ui)] text-[#16181D]/60">{page.storeRule.title}</p>
          <blockquote className="border-l-2 border-[#0F5C63] pl-6 italic">“{page.storeRule.quote}”</blockquote>
          <p><Source href={page.storeRule.sourceUrl} /> <span className="ml-2 font-[family-name:var(--f-mono)] text-[12px] text-[#16181D]/50">verified {page.storeRule.verifiedOn}</span></p>
          {page.additionalRules.map((r, i) => (
            <div key={i} className="pl-6 -indent-6">
              <span className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mr-2">1.{i + 1}</span>
              <strong className="font-[family-name:var(--f-display)] font-medium">{r.title}.</strong> {r.text}{' '}
              <span className="indent-0 inline-block"><Source href={r.sourceUrl} /></span>
            </div>
          ))}
        </Clause>

        <Clause n="2" title="What common SDKs collect">
          <div className="overflow-x-auto rounded-[8px] border border-[#16181D]/10 bg-white">
            <table className="w-full text-left font-[family-name:var(--f-ui)] text-[14px] leading-[1.5]">
              <thead className="text-[#16181D]/60"><tr><th className="p-4 font-medium">SDK / API</th><th className="p-4 font-medium">Data it collects</th><th className="p-4 font-medium">Source</th></tr></thead>
              <tbody>
                {page.sdks.map((s) => (
                  <tr key={s.name} className="border-t border-[#16181D]/10 align-top">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4"><ul className="space-y-2">{s.dataCollected.map((d) => <li key={d}>{d}</li>)}</ul>{s.note && <p className="mt-2 text-[#16181D]/60">{s.note}</p>}</td>
                    <td className="p-4"><Source href={s.sourceUrl} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Everything in this table must appear in your policy if the SDK ships in your build.</p>
        </Clause>

        <Clause n="3" title="Where to put the URL">
          <ol className="space-y-4">
            {page.whereToPaste.map((s, i) => (
              <li key={i} className="grid grid-cols-[40px_1fr]"><span className="font-[family-name:var(--f-mono)] text-[14px] leading-[1.9] text-[#0F5C63]">3.{i + 1}</span><span>{s}</span></li>
            ))}
          </ol>
          {page.whereToPasteSource && <p><Source href={page.whereToPasteSource} /></p>}
        </Clause>

        <Clause n="4" title="Sample clause">
          <figure className="relative rounded-[8px] border border-[#16181D]/10 bg-white p-6 md:p-8 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_28px,rgba(22,24,29,0.04)_28px,rgba(22,24,29,0.04)_29px)]">
            <p className="font-[family-name:var(--f-mono)] text-[12px] text-[#0F5C63] mb-4">§ 4.1 · {page.sampleClause.heading}</p>
            <p>{page.sampleClause.text}</p>
            <figcaption className="mt-6 font-[family-name:var(--f-ui)] text-[12px] text-[#16181D]/60">Illustrative wording. Your generated policy is written from your own answers.</figcaption>
          </figure>
        </Clause>

        <Clause n="5" title="Questions">
          <dl className="space-y-8">
            {page.faqs.map((f) => (
              <div key={f.q}><dt className="font-[family-name:var(--f-display)] text-[20px] mb-2">{f.q}</dt><dd>{f.a}</dd></div>
            ))}
          </dl>
        </Clause>

        {page.related.length > 0 && (
          <nav className="py-16 border-t border-[#16181D]/10" aria-label="Related">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#16181D]/60 mb-4">Related</p>
            <ul className="grid sm:grid-cols-2 gap-4">
              {page.related.map((r) => (
                <li key={r.href}><Link href={r.href} className="flex items-center min-h-12 px-4 rounded-[8px] border border-[#16181D]/10 bg-white hover:border-[#0F5C63]/40">{r.label}</Link></li>
              ))}
            </ul>
          </nav>
        )}
      </main>
    </ClauseShell>
  )
}
