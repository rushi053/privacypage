import { PRICE } from '@/lib/currency'
export const dynamic = 'force-static'

const content = `# PrivacyPage

> PrivacyPage is an AI-powered legal document generator for indie developers and app builders. It generates five document types from a short questionnaire: Privacy Policy, Terms of Service, EULA, Cookie Policy, and Disclaimer. One-time payment — ${PRICE.single} per document or ${PRICE.bundle} for the full bundle (${PRICE.singleInr} / ${PRICE.bundleInr} in India) — with lifetime regenerations. No subscriptions, no account required.

PrivacyPage is built primarily for developers shipping apps with AI tools (Lovable, Bolt, v0, Cursor, Replit). You answer a short wizard about your app's data practices, see a free preview of the generated document, and pay once to unlock and download the full version. Every purchase includes lifetime regenerations, so documents can be updated as the app changes. Refund wording can appear as a section inside Terms of Service when the wizard includes refund-related key policies. It is not a standalone document type.

## Generator

- [Document generator](https://privacypage.io/): Generate a Privacy Policy, Terms of Service, EULA, Cookie Policy, or Disclaimer. Free preview; ${PRICE.single} per document or ${PRICE.bundle} for all five, paid once with lifetime regenerations.

## Pricing

Preview is free. Unlocking a document is a one-time payment. There is no subscription.

- [Pricing](https://privacypage.io/pricing): Preview any document free, with no account. ${PRICE.single} once for a single document, or ${PRICE.bundle} once for the bundle of all five (${PRICE.singleInr} / ${PRICE.bundleInr} in India). No auto-renewal.

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

## Platform guides

What each store, extension, bot, or SDK asks of a privacy policy. Each guide quotes that platform's own rule, links the official source, and lists data common SDKs collect. Store rules change, so check the linked sources before submitting. These pages are not legal advice, and a generated policy does not guarantee store approval.

- [Privacy policy by platform](https://privacypage.io/for): Hub for App Store, Google Play, Chrome Web Store, Discord, and SDK guides.
- [Privacy policy for iOS apps](https://privacypage.io/for/ios-app): App Store Guideline 5.1.1(i), the privacy-policy URL, App Privacy answers, and privacy manifests.
- [Privacy policy for Android apps on Google Play](https://privacypage.io/for/android-app): Google Play User Data policy, the listing and in-app link, and the Data safety section.
- [Privacy policy for Chrome extensions](https://privacypage.io/for/chrome-extension): Chrome Web Store privacy-policy requirement and privacy-tab disclosures.
- [Privacy policy for Discord bots](https://privacypage.io/for/discord-bot): Discord Developer Terms privacy practices and Developer Portal link.
- [Privacy policy for Flutter apps (iOS and Android)](https://privacypage.io/for/flutter-app)
- [Privacy policy for React Native apps](https://privacypage.io/for/react-native-app)
- [Privacy policy for Expo apps (EAS Submit)](https://privacypage.io/for/expo-app)
- [Privacy policy for Mac apps (Mac App Store and direct download)](https://privacypage.io/for/mac-app)
- [Privacy policy for Microsoft Store apps](https://privacypage.io/for/microsoft-store-app)
- [Privacy policy for Firefox add-ons (AMO)](https://privacypage.io/for/firefox-addon)
- [Privacy policy for Shopify app developers](https://privacypage.io/for/shopify-app)
- [Privacy policy for Slack apps (Slack Marketplace)](https://privacypage.io/for/slack-app)
- [Privacy policy for WordPress plugin developers](https://privacypage.io/for/wordpress-plugin)
- [Privacy policy for Alexa skills](https://privacypage.io/for/alexa-skill)
- [Privacy policy for SaaS and web apps](https://privacypage.io/for/saas)
- [Privacy policy for apps using AdMob](https://privacypage.io/for/admob)
- [Privacy policy for apps using analytics (GA4 and other SDKs)](https://privacypage.io/for/analytics-sdks)
- [Privacy policy for apps with push notifications (FCM, OneSignal)](https://privacypage.io/for/push-notifications)
- [Privacy policy for apps that take payments (Stripe, Razorpay)](https://privacypage.io/for/apps-with-payments)
- [Privacy policy for apps using Sign in with Apple](https://privacypage.io/for/sign-in-with-apple)
- [Privacy policy for Facebook Login and Meta apps](https://privacypage.io/for/facebook-login)
- [Privacy policy for Google Sign-In and OAuth apps](https://privacypage.io/for/google-sign-in)
- [Privacy policy for kids' apps (COPPA)](https://privacypage.io/for/kids-apps-coppa)

## Comparisons

How PrivacyPage's one-time pricing compares to subscription-based policy generators.

- [PrivacyPage vs Termly](https://privacypage.io/vs/termly): One-time ${PRICE.single}–${PRICE.bundle} versus Termly's recurring subscription; you own the document outright.
- [PrivacyPage vs iubenda](https://privacypage.io/vs/iubenda): A fraction of iubenda's cost, with no pageview meter and no ongoing license.
- [PrivacyPage vs GetTerms](https://privacypage.io/vs/getterms): A true lifetime option — 8–25x cheaper per document, terms of service included without upgrading.
- [PrivacyPage vs Termageddon](https://privacypage.io/vs/termageddon): ${PRICE.bundle} once versus $119/year forever; you hold the files.
- [PrivacyPage vs FreePrivacyPolicy](https://privacypage.io/vs/freeprivacypolicy): What the "free" generators charge for once you need real coverage, and how PrivacyPage differs.

## Compliance Guides

- [GDPR compliance](https://privacypage.io/compliance/gdpr): What the EU's GDPR requires from an app's privacy policy and how the generator covers it.
- [CCPA compliance](https://privacypage.io/compliance/ccpa): California Consumer Privacy Act requirements for apps with US users.
- [DPDP compliance](https://privacypage.io/compliance/dpdp): India's Digital Personal Data Protection Act and what it means for app privacy policies.

## Optional

- [Blog](https://privacypage.io/blog): Guides on privacy policies, terms of service, cookie policies, and app store compliance.
- [GDPR vs CCPA for developers](https://privacypage.io/blog/gdpr-vs-ccpa-difference-developers): What developers actually need to know about the two regulations.
- [App Store rejected for privacy policy](https://privacypage.io/blog/app-store-rejection-privacy-policy): How to fix a privacy-policy-related App Store rejection fast.
- [App rejected for its privacy policy](https://privacypage.io/guides/app-rejected-privacy-policy): Rejection reasons and fixes for the App Store, Google Play, Chrome Web Store, and Meta, with links to the official rules. Fixing the policy does not guarantee approval.
`

export function GET() {
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
