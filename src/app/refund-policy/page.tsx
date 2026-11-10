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

const linkClass = 'text-[#0F5C63] underline underline-offset-4 decoration-[#0F5C63]/30 hover:decoration-[#0F5C63]'
const h2Class = 'font-[family-name:var(--f-display)] text-[24px] md:text-[28px] leading-[1.25] tracking-[-0.01em] text-[#16181D] mb-3'

export default function RefundPolicyPage() {
  return (
    <ClauseShell>
      <main className="mx-auto max-w-[720px] px-6 md:px-8 pt-16 md:pt-24 pb-24">
        <p className="font-[family-name:var(--f-mono)] text-[14px] text-[#0F5C63] mb-6">[effective date — set on publish]</p>
        <h1 className="font-[family-name:var(--f-display)] text-[40px] md:text-[56px] leading-[1.1] tracking-[-0.02em] mb-8">Refund policy</h1>
        <div className="font-[family-name:var(--f-doc)] text-[18px] leading-[1.6] text-[#16181D]/85 space-y-10">
          <p>
            If you’re not happy with a PrivacyPage purchase, you can ask for a full refund within 30 days of payment.
          </p>

          <section>
            <h2 className={h2Class}>Who can ask</h2>
            <p>
              Anyone who bought anything from PrivacyPage, within 30 days of the payment: a Single document (shown as 'Pro' on some receipts) or Bundle — all 5 purchase.
            </p>
          </section>

          <section>
            <h2 className={h2Class}>How to ask</h2>
            <p>
              Email us at{' '}
              <a href={SUPPORT_MAILTO} className={linkClass}>
                {SUPPORT_EMAIL}
              </a>{' '}
              from the address you used at checkout, or include your Razorpay order or payment ID. No reason is required — if you’re not happy with your generated policy, that’s enough.
            </p>
          </section>

          <section>
            <h2 className={h2Class}>How the refund is paid</h2>
            <p>
              We’ll reply within 48 hours and start your refund within [7] days of your request. After that, Razorpay and your bank typically take 5–7 business days to show the credit on the original payment method, for the amount you were charged. That 5–7 day timing is set by them, not a promise from us.
            </p>
          </section>

          <section>
            <h2 className={h2Class}>Currency</h2>
            <p>
              We refund in the currency you were charged. If your bank or card converts currencies, any difference is set by your bank, not by PrivacyPage.
            </p>
          </section>

          <section>
            <h2 className={h2Class}>After a refund</h2>
            <p>
              A refund cancels the license key for that purchase, including free regenerations, and your right to use the documents bought with it.
            </p>
          </section>

          <section>
            <h2 className={h2Class}>Later purchases</h2>
            <p>
              If you’ve already had a refund, we may decline a refund on a later purchase of the same document for the same app or website. This never limits a refund when a document doesn’t work as described, or any right you have under law.
            </p>
          </section>

          <section>
            <h2 className={h2Class}>Who we are</h2>
            <p>
              PrivacyPage is run by Rushiraj Jadeja (sole proprietor), [address], India. Grievance Officer: Rushiraj Jadeja, [email], [phone]. We acknowledge complaints within 48 hours, with a reference number, and resolve them within one month.
            </p>
          </section>

          <section>
            <h2 className={h2Class}>Contact</h2>
            <p>
              Questions about this policy:{' '}
              <a href={SUPPORT_MAILTO} className={linkClass}>
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
