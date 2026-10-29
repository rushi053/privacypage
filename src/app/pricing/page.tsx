import Link from 'next/link'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { countryFromHeaders, getPricingForCountry } from '@/lib/currency'
import { ClauseShell } from '@/components/ClauseShell'

// Prices come only from the server price list (PRICING), with the currency picked from the
// visitor's country header — the same source /api/geo and create-order use.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing — One-Time Payment, No Subscription | PrivacyPage',
  description: 'Preview any document free with no account. Pay once to unlock a single document or the bundle of all five. No auto-renewals.',
  alternates: { canonical: 'https://privacypage.io/pricing' },
}

export default async function PricingPage() {
  const p = getPricingForCountry(countryFromHeaders(await headers()))
  const plans = [
    { name: 'Free preview', price: 'Free', note: 'No account', points: ['Answer the wizard questions', 'Preview the first part of your document', 'See exactly what you would unlock'], cta: 'Preview free' },
    { name: 'Single document', price: p.singleDisplay, note: 'One-time', points: ['One full document: Privacy Policy, Terms, EULA, Cookie Policy or Disclaimer', 'Export as HTML, Markdown or plain text', 'Regenerate when your app changes'], cta: 'Generate a document' },
    { name: 'Bundle — all 5', price: p.bundleDisplay, note: 'One-time', points: ['Privacy Policy, Terms of Service, EULA, Cookie Policy and Disclaimer', 'Export as HTML, Markdown or plain text', 'Regenerate when your app changes'], cta: 'Get the bundle' },
  ]
  return (
    <ClauseShell>
      <main className="mx-auto max-w-[1040px] px-6 md:px-8 pt-16 md:pt-24 pb-16">
        <p className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mb-6">Pricing · prices in {p.currency}</p>
        <h1 className="font-[family-name:var(--f-display)] text-[40px] md:text-[56px] leading-[1.1] tracking-[-0.02em] mb-8">Pay once. No subscription.</h1>
        <p className="font-[family-name:var(--f-doc)] text-[20px] leading-[1.6] text-[#16181D]/85 max-w-[640px] mb-16">Preview any document free with no account. Unlock it with a one-time payment through Razorpay. No auto-renewals.</p>
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {plans.map((pl) => (
            <section key={pl.name} className="rounded-[8px] border border-[#16181D]/10 bg-white p-6 flex flex-col">
              <h2 className="text-[14px] uppercase tracking-[0.08em] text-[#16181D]/60 mb-4">{pl.name}</h2>
              <p className="font-[family-name:var(--f-display)] text-[40px] leading-none mb-2" data-fixed-price>{pl.price}</p>
              <p className="text-[14px] text-[#16181D]/60 mb-6">{pl.note}</p>
              <ul className="font-[family-name:var(--f-doc)] text-[16px] leading-[1.5] space-y-2 mb-8 flex-1">
                {pl.points.map((x) => <li key={x}>— {x}</li>)}
              </ul>
              <Link href="/#generate" className="flex items-center justify-center h-12 rounded-[8px] bg-[#0F5C63] text-white text-[16px] font-medium hover:bg-[#0B4A50]">{pl.cta}</Link>
            </section>
          ))}
        </div>
        <p className="text-[14px] text-[#16181D]/60 max-w-[640px]">Prices are shown in INR in India and USD elsewhere, based on your location. Checkout charges the same amount shown here. PrivacyPage documents are not legal advice.</p>
      </main>
    </ClauseShell>
  )
}
