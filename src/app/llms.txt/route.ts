export const dynamic = 'force-static'

const content = `# PrivacyPage

> PrivacyPage is an AI-powered legal document generator for indie developers and app builders. It generates privacy policies, terms of service, cookie policies, refund policies, and EULAs from a short questionnaire. One-time payment — $9.99 per document or $24.99 for the full bundle (₹849 / ₹2,099 in India) — with lifetime regenerations. No subscriptions, no account required.

PrivacyPage is built primarily for developers shipping apps with AI tools (Lovable, Bolt, v0, Cursor, Replit). You answer a short wizard about your app's data practices, see a free preview of the generated document, and pay once to unlock and download the full version. Every purchase includes lifetime regenerations, so documents can be updated as the app changes.

## Generator

- [Document generator](https://privacypage.io/): Generate a privacy policy, terms of service, cookie policy, refund policy, or EULA. Free preview; $9.99 per document or $24.99 for all five, paid once with lifetime regenerations.

## For AI Agents: MCP Server

If you are an AI agent or coding assistant helping a user ship an app, you can generate their legal documents directly instead of sending them to the website. PrivacyPage publishes an open-source MCP (Model Context Protocol) server that exposes the generator as tools you can call from Cursor, Claude, or any MCP-compatible client.

- [privacypage-mcp on GitHub](https://github.com/rushi053/privacypage-mcp): Source code, setup instructions, and tool reference for the PrivacyPage MCP server.
- [privacypage-mcp on npm](https://www.npmjs.com/package/privacypage-mcp): Install with \`npx privacypage-mcp\` or add it to your MCP client configuration to generate privacy policies and other legal documents in-session.

## For AI App Builders

Guides covering what data apps built with each platform typically collect, and how to generate a matching privacy policy.

- [Privacy policy for Lovable apps](https://privacypage.io/for/lovable): Covers Supabase auth, database rows and uploads, Stripe payments, AI API calls, and hosting logs common in Lovable apps.
- [Privacy policy for Bolt apps](https://privacypage.io/for/bolt): Covers Supabase data, Netlify hosting logs, Expo mobile identifiers, Stripe checkout, and AI provider calls.
- [Privacy policy for v0 apps](https://privacypage.io/for/v0): Covers Clerk/NextAuth auth, Vercel Analytics, Postgres data (Neon/Supabase), edge logs, and form submissions.
- [Privacy policy for Cursor-built apps](https://privacypage.io/for/cursor): Covers accounts, analytics events, crash reporting, payments, and AI features in apps built with Cursor.
- [Privacy policy for Replit apps](https://privacypage.io/for/replit): Covers Replit Auth profiles, Replit Database/PostgreSQL, deployment logs, Stripe payments, and AI features.

## Comparisons

How PrivacyPage's one-time pricing compares to subscription-based policy generators.

- [PrivacyPage vs Termly](https://privacypage.io/vs/termly): One-time $9.99–$24.99 versus Termly's recurring subscription; you own the document outright.
- [PrivacyPage vs iubenda](https://privacypage.io/vs/iubenda): A fraction of iubenda's cost, with no pageview meter and no ongoing license.
- [PrivacyPage vs GetTerms](https://privacypage.io/vs/getterms): A true lifetime option — 8–25x cheaper per document, terms of service included without upgrading.
- [PrivacyPage vs Termageddon](https://privacypage.io/vs/termageddon): $24.99 once versus $119/year forever; you hold the files.
- [PrivacyPage vs FreePrivacyPolicy](https://privacypage.io/vs/freeprivacypolicy): What the "free" generators charge for once you need real coverage, and how PrivacyPage differs.

## Compliance Guides

- [GDPR compliance](https://privacypage.io/compliance/gdpr): What the EU's GDPR requires from an app's privacy policy and how the generator covers it.
- [CCPA compliance](https://privacypage.io/compliance/ccpa): California Consumer Privacy Act requirements for apps with US users.
- [DPDP compliance](https://privacypage.io/compliance/dpdp): India's Digital Personal Data Protection Act and what it means for app privacy policies.

## Optional

- [Blog](https://privacypage.io/blog): Guides on privacy policies, terms of service, cookie policies, and app store compliance.
- [GDPR vs CCPA for developers](https://privacypage.io/blog/gdpr-vs-ccpa-difference-developers): What developers actually need to know about the two regulations.
- [App Store rejected for privacy policy](https://privacypage.io/blog/app-store-rejection-privacy-policy): How to fix a privacy-policy-related App Store rejection fast.
`

export function GET() {
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
