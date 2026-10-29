import Link from 'next/link'
import type { Metadata } from 'next'
import { ClauseShell } from '@/components/ClauseShell'

const URL = 'https://privacypage.io/guides/app-rejected-privacy-policy'
const VERIFIED = '2026-10-30'

export const metadata: Metadata = {
  title: 'App Rejected for Privacy Policy? Fixes for App Store, Google Play, Chrome & Meta | PrivacyPage',
  description: 'Why apps and extensions get rejected over the privacy policy — Apple 5.1.1(i), Google Play User Data, Chrome Web Store, Meta Platform Terms — and how to fix each one, with links to the official rules.',
  alternates: { canonical: URL },
}

const stores = [
  {
    store: 'Apple App Store', rule: 'Guideline 5.1.1(i) — Privacy Policies',
    quote: 'All apps must include a link to their privacy policy in the App Store Connect metadata field and within the app in an easily accessible manner.',
    src: 'https://developer.apple.com/app-store/review/guidelines/',
    causes: ['No privacy policy link inside the app (only in App Store Connect).', 'The policy does not say what data is collected, how, and every use of it.', 'Third-party SDKs (analytics, ads) are not covered.', 'No retention/deletion section or no way to revoke consent and request deletion.', 'The App Privacy “nutrition label” contradicts the policy.'],
    fix: '/for/ios-app', fixLabel: 'iOS / App Store requirements',
  },
  {
    store: 'Google Play', rule: 'User Data policy',
    quote: 'Please make sure your privacy policy is available on an active, publicly accessible and non-geofenced URL (no PDFs) and is non-editable.',
    src: 'https://support.google.com/googleplay/android-developer/answer/10144311',
    causes: ['The URL is a PDF, a Google Doc that can be edited, needs a login, or is geoblocked.', 'The link is missing from the store listing or from inside the app.', 'The Data safety form does not match the policy or the SDKs in the app.', 'No way to request account and data deletion.'],
    fix: '/for/android-app', fixLabel: 'Android / Google Play requirements',
  },
  {
    store: 'Chrome Web Store', rule: 'Program Policies — Privacy Policies',
    quote: 'If your Product handles any user data, then you must post an accurate and up to date privacy policy.',
    src: 'https://developer.chrome.com/docs/webstore/program-policies/privacy',
    causes: ['Privacy policy field in the Developer Dashboard is empty.', 'The extension reads browsing data, page content or identity but the policy does not say so.', 'The data use certifications (Limited Use) are not reflected in the policy.'],
    fix: '/for/chrome-extension', fixLabel: 'Chrome extension requirements',
  },
  {
    store: 'Meta (Facebook Login)', rule: 'Platform Terms — 4. Privacy Policy',
    quote: 'You will provide, maintain, and comply with a privacy policy that is available through an active, publicly available, easily accessible (including by our crawlers), and non-geoblocked URL.',
    src: 'https://developers.facebook.com/terms/dfc_platform_terms/',
    causes: ['Meta’s crawler can’t load the URL (login wall, bot protection, redirect, geoblock).', 'The URL is missing from the App Dashboard privacy policy field.', 'The policy does not explain how users request deletion of their data.'],
    fix: '/for/facebook-login', fixLabel: 'Facebook Login requirements',
  },
]

const checklist = [
  'Host the policy at a public HTTPS URL: no login, no PDF, no geoblocking, no editable doc.',
  'Open the URL in a private window and from a different country or network to confirm it loads.',
  'Put the same URL in the store console field and link it inside the app or extension.',
  'List every type of data you collect, how you collect it and every use.',
  'Name the third-party SDKs and services (analytics, ads, crash reporting, login, payments).',
  'Explain retention, deletion and how users revoke consent or request deletion.',
  'Make your store privacy forms (App Privacy, Data safety, Chrome certifications) match the policy.',
  'Reply to the reviewer with what you changed and where the link is.',
]

const faqs = [
  { q: 'Why was my app rejected under Guideline 5.1.1?', a: 'Usually because the privacy policy link is missing in the app or App Store Connect, or the policy doesn’t identify the data collected, its uses, third-party sharing, retention and deletion, which Apple’s Guideline 5.1.1(i) asks for.' },
  { q: 'Can I host my privacy policy as a Google Doc or PDF?', a: 'Google Play asks for an active, public, non-geofenced URL, says no PDFs, and says the policy must be non-editable. A normal web page is the safest option.' },
  { q: 'Does fixing the policy mean my app will pass review?', a: 'No. A complete policy removes one common reason for rejection, but reviewers check many other things. Read the reviewer’s message and the linked rules. This is not legal advice.' },
]

export default function RejectionGuide() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: 'App rejected for its privacy policy? How to fix it', dateModified: VERIFIED, mainEntityOfPage: URL, author: { '@type': 'Organization', name: 'PrivacyPage' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ]
  return (
    <ClauseShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <main className="mx-auto max-w-[820px] px-6 md:px-8 pt-16 md:pt-24 pb-16 font-[family-name:var(--f-doc)]">
        <p className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mb-6">Guide · Sources checked {VERIFIED}</p>
        <h1 className="font-[family-name:var(--f-display)] text-[40px] md:text-[52px] leading-[1.1] tracking-[-0.02em] mb-8">App rejected for its privacy policy? How to fix it</h1>
        <p className="text-[20px] leading-[1.6] text-[#16181D]/85 mb-12">
          Most privacy policy rejections come down to three things: the link can’t be reached, it isn’t where the store expects it, or it doesn’t cover the data your app and its SDKs actually collect. Below are the rules for each store, quoted from the official pages, with the usual causes and fixes. Not legal advice.
        </p>
        {stores.map((s) => (
          <section key={s.store} className="mb-12">
            <h2 className="font-[family-name:var(--f-display)] text-[28px] leading-[1.2] mb-4">{s.store}: {s.rule}</h2>
            <blockquote className="border-l-2 border-[#0F5C63] pl-5 text-[18px] leading-[1.6] italic mb-3">“{s.quote}”</blockquote>
            <p className="font-[family-name:var(--f-mono)] text-[13px] mb-5"><a className="text-[#0F5C63] underline" href={s.src} rel="noopener">Official source</a> · checked {VERIFIED}</p>
            <h3 className="font-semibold text-[17px] mb-2">Common causes</h3>
            <ul className="list-disc pl-6 text-[17px] leading-[1.6] mb-4">{s.causes.map((c) => <li key={c}>{c}</li>)}</ul>
            <Link className="text-[#0F5C63] underline text-[17px]" href={s.fix}>Full {s.fixLabel} →</Link>
          </section>
        ))}
        <section className="mb-12">
          <h2 className="font-[family-name:var(--f-display)] text-[28px] mb-4">Fix checklist before you resubmit</h2>
          <ol className="list-decimal pl-6 text-[17px] leading-[1.7]">{checklist.map((c) => <li key={c}>{c}</li>)}</ol>
        </section>
        <section className="mb-12">
          <h2 className="font-[family-name:var(--f-display)] text-[28px] mb-4">FAQ</h2>
          {faqs.map((f) => (<div key={f.q} className="mb-5"><h3 className="font-semibold text-[18px] mb-1">{f.q}</h3><p className="text-[17px] leading-[1.6]">{f.a}</p></div>))}
        </section>
        <p className="text-[17px]">More: <Link className="text-[#0F5C63] underline" href="/for">Privacy policy by platform</Link> · <Link className="text-[#0F5C63] underline" href="/">Generate a privacy policy</Link></p>
      </main>
    </ClauseShell>
  )
}
