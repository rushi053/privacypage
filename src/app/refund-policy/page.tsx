import type { Metadata } from 'next'
import { ClauseShell } from '@/components/ClauseShell'

const URL = 'https://privacypage.io/refund-policy'
const SUPPORT_EMAIL = 'rushirajjadeja@gmail.com'
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=PrivacyPage%20Refund`

export const metadata: Metadata = {
  title: 'Refund Policy — 30-Day Full Refund | PrivacyPage',
  description: 'If you’re not happy with a PrivacyPage purchase, email us within 30 days of payment for a full refund. No reason required.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Refund Policy — 30-Day Full Refund | PrivacyPage',
    description: 'If you’re not happy with a PrivacyPage purchase, email us within 30 days of payment for a full refund. No reason required.',
    url: URL,
    siteName: 'PrivacyPage',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund Policy — 30-Day Full Refund | PrivacyPage',
    description: 'If you’re not happy with a PrivacyPage purchase, email us within 30 days of payment for a full refund. No reason required.',
  },
}

export default function RefundPolicyPage() {
  return (
    <ClauseShell>
      <main className="mx-auto max-w-[720px] px-6 md:px-8 pt-16 md:pt-24 pb-24">
        <p className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mb-6">Effective November 2026</p>
        <h1 className="font-[family-name:var(--f-display)] text-[40px] md:text-[56px] leading-[1.1] tracking-[-0.02em] mb-8">Refund policy</h1>
        <div className="font-[family-name:var(--f-doc)] text-[18px] leading-[1.6] text-[#16181D]/85 space-y-10">
          <p>
            If you’re not happy with a PrivacyPage purchase, you can ask for a full refund within 30 days of payment.
          </p>

          <section>
            <h2 className="font-[family-name:var(--f-display)] text-[24px] md:text-[28px] leading-[1.25] tracking-[-0.01em] text-[#16181D] mb-3">Who can ask</h2>
            <p>
              Anyone who bought a PrivacyPage document or the five-document bundle, within 30 days of the payment.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--f-display)] text-[24px] md:text-[28px] leading-[1.25] tracking-[-0.01em] text-[#16181D] mb-3">How to ask</h2>
            <p>
              Email{' '}
              <a href={SUPPORT_MAILTO} className="text-[#0F5C63] underline underline-offset-4 decoration-[#0F5C63]/30 hover:decoration-[#0F5C63]">
                {SUPPORT_EMAIL}
              </a>{' '}
              and include your Razorpay order ID or payment ID. No reason is required — if you’re not happy with your generated policy, that’s enough. The email you used at checkout is also helpful so we can find the purchase.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--f-display)] text-[24px] md:text-[28px] leading-[1.25] tracking-[-0.01em] text-[#16181D] mb-3">How the refund is paid</h2>
            <p>
              The refund is sent back to the original payment method through Razorpay, for the amount you were charged. Banks and Razorpay typically take around 5–7 business days to show the credit. That timing is set by them, not a promise from us.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--f-display)] text-[24px] md:text-[28px] leading-[1.25] tracking-[-0.01em] text-[#16181D] mb-3">Currency</h2>
            <p>
              We refund in the currency you were charged. If your bank or card converts currencies, any difference is set by your bank, not by PrivacyPage.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--f-display)] text-[24px] md:text-[28px] leading-[1.25] tracking-[-0.01em] text-[#16181D] mb-3">Repeat requests</h2>
            <p>
              We may decline obvious repeat abuse.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--f-display)] text-[24px] md:text-[28px] leading-[1.25] tracking-[-0.01em] text-[#16181D] mb-3">Contact</h2>
            <p>
              Questions about this policy: {' '}
              <a href={SUPPORT_MAILTO} className="text-[#0F5C63] underline underline-offset-4 decoration-[#0F5C63]/30 hover:decoration-[#0F5C63]">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </ClauseShell>
  )
}
