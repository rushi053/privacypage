// Data for the programmatic SEO landing pages:
//   /for/[builder]      — AI app builders (Lovable, Bolt, v0, Cursor, Replit)
//   /vs/[competitor]    — competitor comparisons (Termly, iubenda, GetTerms, Termageddon, FreePrivacyPolicy)
//   /compliance/[regulation] — regulation guides (GDPR, CCPA, DPDP)
//
// Paragraph strings may contain minimal inline HTML (<strong>, <a>, <em>) and are
// rendered with dangerouslySetInnerHTML, same convention as src/lib/blog.ts.

export interface Faq {
  q: string
  a: string
}

export interface RelatedLink {
  href: string
  label: string
}

export interface BuilderPage {
  slug: string
  name: string
  h1: string
  metaTitle: string
  metaDescription: string
  keyword: string
  tagline: string
  intro: string[]
  dataHeading: string
  dataPoints: { title: string; desc: string }[]
  requirementsHeading: string
  requirements: string[]
  hostingTip: string
  faqs: Faq[]
  relatedBlog: RelatedLink[]
}

export interface CompetitorPage {
  slug: string
  name: string
  h1: string
  metaTitle: string
  metaDescription: string
  keyword: string
  tagline: string
  intro: string[]
  pricingSourceNote: string
  comparisonRows: { label: string; them: string; us: string }[]
  prosThem: { title: string; desc: string }[]
  prosUs: { title: string; desc: string }[]
  verdict: string[]
  callout?: { text: string; href: string; linkLabel: string }
  faqs: Faq[]
  relatedBlog: RelatedLink[]
}

export interface RegulationPage {
  slug: string
  name: string
  fullName: string
  h1: string
  metaTitle: string
  metaDescription: string
  keyword: string
  tagline: string
  intro: string[]
  checklistHeading: string
  checklist: string[]
  coverage: { title: string; desc: string }[]
  faqs: Faq[]
  relatedBlog: RelatedLink[]
}

/* ────────────────────────────── /for/[builder] ────────────────────────────── */

export const builderPages: BuilderPage[] = [
  {
    slug: 'lovable',
    name: 'Lovable',
    h1: 'Privacy Policy Generator for Lovable Apps',
    metaTitle: 'Privacy Policy Generator for Lovable Apps | PrivacyPage',
    metaDescription:
      'Generate a privacy policy for your Lovable app in 60 seconds. Covers Supabase auth, Stripe, AI APIs. GDPR & App Store ready. Free preview, $9.99 once.',
    keyword: 'privacy policy generator for lovable apps',
    tagline:
      'You shipped an app with Lovable. Now get the legal doc it needs — in 60 seconds, free to preview.',
    intro: [
      `You prompted your way to a working product in Lovable — auth, database, payments, maybe an AI feature. But the moment real users can sign up, your app is collecting personal data, and that comes with legal obligations whether you have 3 users or 3,000. A privacy policy is not a nice-to-have: Google OAuth verification asks for one, the App Store requires one, and privacy laws like GDPR assume you already have one.`,
      `The good news: for a typical Lovable app the policy is very predictable, because the Lovable stack is predictable. PrivacyPage asks you a handful of plain-English questions about what your app actually does and generates a complete, customized privacy policy you can paste straight into your project. The full document is free to preview — you pay <strong>$9.99 once</strong> only if you want to unlock and download it. No subscription.`,
    ],
    dataHeading: 'What your Lovable app is probably collecting',
    dataPoints: [
      {
        title: 'Supabase Auth accounts',
        desc: 'Lovable wires most projects to Supabase. Email addresses, hashed passwords or Google/GitHub OAuth identities, session tokens, and sign-in IP logs all count as personal data — and you, not Supabase, are the data controller.',
      },
      {
        title: 'Database rows and uploads',
        desc: 'Anything users type or upload lives in your Supabase Postgres database and Storage buckets: profile details, documents, images. Your policy needs to say what you store and for how long.',
      },
      {
        title: 'Stripe payments',
        desc: 'If you added checkout, Stripe processes names, emails, and card details on your behalf. That makes Stripe a third-party processor you must disclose.',
      },
      {
        title: 'AI API calls',
        desc: 'Features built on OpenAI, Anthropic, or Gemini send user input to those providers. Users have a right to know their prompts leave your app.',
      },
      {
        title: 'Hosting and analytics logs',
        desc: 'Your lovable.app (or custom) domain logs IP addresses and device data, and any analytics snippet you added collects usage events.',
      },
    ],
    requirementsHeading: 'What you need before launch',
    requirements: [
      `<strong>A public policy URL.</strong> Google OAuth consent screen verification, Apple's App Store (guideline 5.1.1), and Google Play's Data safety form all require a privacy policy hosted at a publicly reachable link — before you submit, not after.`,
      `<strong>GDPR coverage if anyone in the EU can sign up.</strong> GDPR applies based on where your users are, not where you are. Your policy must name a legal basis for each processing purpose, list your processors (Supabase, Stripe, your AI provider), state retention periods, and explain user rights like access and erasure. See our <a href="/compliance/gdpr">plain-English GDPR guide</a>.`,
      `<strong>Disclosure of every third party.</strong> The most common mistake in vibe-coded apps is a template policy that never mentions Supabase or the AI APIs actually in use. A policy that doesn't match your real stack can be worse than none, because it misrepresents your practices.`,
    ],
    hostingTip:
      'After generating, copy the HTML output and prompt Lovable: "Add a /privacy route that renders this HTML." Lovable will scaffold the page in seconds, and you\'ll have a live URL to paste into OAuth and store forms.',
    faqs: [
      {
        q: 'Does my Lovable app need a privacy policy if it is just a prototype?',
        a: 'If it is publicly reachable and anyone can create an account, yes. Sign-up forms collect personal data (email at minimum), and Google OAuth verification will ask for a policy URL even for small apps. Private prototypes with no real users can wait.',
      },
      {
        q: 'Does Supabase provide a privacy policy for my app?',
        a: "No. Supabase's own privacy policy covers Supabase as a company. For your app, you are the data controller and Supabase is your processor — you need your own policy that discloses Supabase as a third-party service.",
      },
      {
        q: 'How do I add the generated policy to my Lovable app?',
        a: 'Copy the HTML export from PrivacyPage and prompt Lovable to create a /privacy page that renders it. That gives you a public URL you can submit to app stores and OAuth consent screens.',
      },
      {
        q: 'Is PrivacyPage really free?',
        a: 'Generating and previewing the full document is free with no account. Unlocking the download (HTML, Markdown, plain text) is a one-time $9.99 payment — or $24.99 for all five document types. There is no subscription.',
      },
    ],
    relatedBlog: [
      { href: '/blog/how-to-add-privacy-policy-app-store', label: 'How to Add a Privacy Policy to Your App Store Listing' },
      { href: '/blog/free-privacy-policy-generator', label: 'Free Privacy Policy Generator: 2026 Guide' },
    ],
  },
  {
    slug: 'bolt',
    name: 'Bolt',
    h1: 'Privacy Policy Generator for Bolt.new Apps',
    metaTitle: 'Privacy Policy Generator for Bolt.new Apps | PrivacyPage',
    metaDescription:
      'Built an app with Bolt.new? Generate its privacy policy in 60 seconds — covers Supabase, Netlify, Expo mobile builds. Free preview, $9.99 one-time.',
    keyword: 'privacy policy generator for bolt.new apps',
    tagline:
      'From prompt to production on Bolt.new — don\'t let a missing legal page be the thing that blocks your launch.',
    intro: [
      `Bolt.new gets you from idea to deployed full-stack app astonishingly fast — and with Expo support, even to a native iOS or Android app. That speed cuts both ways: it is now completely normal to reach "submit to the App Store" within a week of starting, long before anyone has thought about legal documents. Both Apple and Google will stop you right there, because a privacy policy URL is a hard requirement for submission.`,
      `PrivacyPage exists for exactly this moment. Answer a short wizard about what your Bolt app collects — accounts, payments, analytics, AI calls — and get a complete privacy policy in about 60 seconds. Preview the whole document for free; pay <strong>$9.99 once</strong> to unlock it. No subscription, no account.`,
    ],
    dataHeading: 'What a typical Bolt.new app collects',
    dataPoints: [
      {
        title: 'Supabase accounts and data',
        desc: "Bolt's built-in Supabase integration means user emails, OAuth identities, and everything users store in Postgres is personal data under your control.",
      },
      {
        title: 'Netlify hosting logs',
        desc: 'One-click Netlify deploys log request IPs and user agents. Server logs are personal data under GDPR and belong in your policy.',
      },
      {
        title: 'Mobile identifiers (Expo builds)',
        desc: "If you shipped a mobile app via Bolt's Expo integration, you likely collect device identifiers, push notification tokens, and crash data — all of which must appear in Apple's privacy labels and Google's Data safety form.",
      },
      {
        title: 'Stripe checkout',
        desc: 'Payments mean names, emails, and billing data flowing through Stripe as a disclosed third-party processor.',
      },
      {
        title: 'AI provider calls',
        desc: 'Anthropic, OpenAI, or other model APIs receive whatever your users type into AI features. Disclose it.',
      },
    ],
    requirementsHeading: 'What the stores require before you can ship',
    requirements: [
      `<strong>Apple App Store:</strong> guideline 5.1.1 requires a privacy policy link in App Store Connect and inside the app, plus accurate App Privacy "nutrition labels" describing data collection. Rejections for missing or mismatched policies are among the most common — see our guide on <a href="/blog/app-store-rejection-privacy-policy">fixing privacy policy rejections</a>.`,
      `<strong>Google Play:</strong> the Data safety section must be completed for every app, and a privacy policy URL is mandatory if you collect any personal or sensitive data — which any app with accounts does.`,
      `<strong>GDPR and CCPA:</strong> these apply based on your users' location. A Bolt app with a public URL has global users by default, so your policy needs legal bases, user rights, retention periods, and a full list of processors. Our <a href="/compliance/gdpr">GDPR</a> and <a href="/compliance/ccpa">CCPA</a> guides cover what that means in practice.`,
    ],
    hostingTip:
      'Copy the HTML export and prompt Bolt: "Create a /privacy page that renders this HTML and link it in the footer." For Expo builds, also paste the hosted URL into App Store Connect and the Play Console Data safety form.',
    faqs: [
      {
        q: 'Bolt deployed my app to a bolt.host / netlify.app subdomain. Can that host my policy?',
        a: 'Yes. App stores only require a publicly accessible URL — a /privacy route on your deployed Bolt app subdomain works fine. You can move it to a custom domain later without resubmitting, as long as you update the URL in your store listings.',
      },
      {
        q: 'Do I need a separate policy for my Expo mobile build and my web app?',
        a: 'Usually one policy covers both if the data practices are the same. Mention that the policy covers the website and the mobile apps, and include mobile-specific items like push tokens and device identifiers.',
      },
      {
        q: 'What about terms of service?',
        a: 'Stores do not always require ToS, but you want one before taking payments — it is where refund terms and liability limits live. PrivacyPage generates Terms of Service too, and the $24.99 bundle covers all five document types.',
      },
      {
        q: 'How long does this actually take?',
        a: 'The wizard is roughly ten questions about your app name, data collected, and third-party services. Most people finish in about a minute and preview the full document immediately, free.',
      },
    ],
    relatedBlog: [
      { href: '/blog/app-store-rejection-privacy-policy', label: 'App Store Rejected for Privacy Policy? How to Fix It Fast' },
      { href: '/blog/free-privacy-policy-generator-ios-apps', label: 'Free Privacy Policy Generator for iOS Apps' },
    ],
  },
  {
    slug: 'v0',
    name: 'v0',
    h1: 'Privacy Policy Generator for v0 Apps',
    metaTitle: 'Privacy Policy Generator for v0 Apps | PrivacyPage',
    metaDescription:
      'Ship your v0-built Next.js app with a real privacy policy. Covers Vercel Analytics, Clerk/NextAuth, Postgres. 60 seconds, free preview, $9.99 once.',
    keyword: 'privacy policy generator for v0 apps',
    tagline:
      'v0 writes the Next.js code. This writes the legal page — customized to your stack in 60 seconds.',
    intro: [
      `v0 by Vercel turns prompts into production-grade Next.js apps, and one-click deploys put them live on a vercel.app URL minutes later. What v0 will not generate for you is the privacy policy — and the moment your app has a sign-up form, a waitlist, analytics, or a contact form, you are collecting personal data and legally need one.`,
      `PrivacyPage is built for developers shipping fast: a ~10-question wizard, a complete customized privacy policy in about 60 seconds, and the whole document free to preview. Unlocking the export costs <strong>$9.99 one time</strong> — deliberately the opposite of the subscription pricing most policy tools charge for what is, for you, a one-time need.`,
    ],
    dataHeading: 'What a typical v0 app collects',
    dataPoints: [
      {
        title: 'Auth via Clerk or NextAuth',
        desc: 'v0 apps commonly wire authentication through Clerk or Auth.js — emails, OAuth profile data, and session cookies are personal data you control and must disclose.',
      },
      {
        title: 'Vercel Analytics & Speed Insights',
        desc: 'Vercel Analytics is privacy-friendly (no cookies), but it still processes visitor data — page views, referrers, country, device class — and belongs in your policy.',
      },
      {
        title: 'Postgres data (Neon / Supabase)',
        desc: 'Whatever your users store — profiles, projects, messages — sits in your database. Your policy states what you keep and for how long.',
      },
      {
        title: 'Edge request logs',
        desc: 'Vercel logs IP addresses and request metadata for every visit. Under GDPR, IPs are personal data.',
      },
      {
        title: 'Forms, waitlists, and emails',
        desc: 'Even a simple waitlist collecting emails via Resend or a form action is data collection with disclosure obligations.',
      },
    ],
    requirementsHeading: 'What the law expects from your policy',
    requirements: [
      `<strong>GDPR (EU visitors):</strong> your policy must identify who you are, why you process each category of data and on what legal basis, which processors you use (Vercel, Clerk, your database host), how long you retain data, and how users exercise rights like access and deletion. Details in our <a href="/compliance/gdpr">GDPR guide</a>.`,
      `<strong>CCPA (California visitors):</strong> if the thresholds apply to you — or you simply want to be safe — you disclose the categories of personal information collected and give California users a way to request access or deletion. Our <a href="/compliance/ccpa">CCPA guide</a> explains the thresholds in plain English.`,
      `<strong>OAuth and API verifications:</strong> Google's OAuth consent screen review requires a privacy policy URL on your domain. Ship without one and your "Sign in with Google" stays stuck in testing mode with a 100-user cap.`,
    ],
    hostingTip:
      "Copy the HTML export into a new app/privacy/page.tsx in your v0 project (or paste it into v0 and ask it to create the route), then add a footer link. Deploy — your policy URL is live at yourapp.vercel.app/privacy.",
    faqs: [
      {
        q: 'Vercel Analytics is cookieless — do I still need a privacy policy?',
        a: 'Yes. Cookieless does not mean data-less: analytics still processes visitor information, and your auth, database, and logs collect more. A privacy policy is about all personal data processing, not just cookies.',
      },
      {
        q: 'Can I keep the policy in my repo as a page instead of a hosted PDF?',
        a: 'Absolutely — a rendered /privacy route is the standard approach and what PrivacyPage\'s HTML export is designed for. Search engines and store reviewers both prefer a real page over a PDF.',
      },
      {
        q: 'What if I add features later — do I pay again?',
        a: 'No. Your one-time license includes lifetime regenerations, so when you add Stripe or switch auth providers, come back, adjust your answers, and regenerate the updated document free.',
      },
      {
        q: 'Does PrivacyPage cover cookie banners?',
        a: 'PrivacyPage generates the documents — privacy policy, cookie policy, terms, EULA, disclaimer. It does not inject a consent banner widget. Many v0 apps using cookieless analytics don\'t need one; if you add advertising cookies, pair your cookie policy with a consent tool.',
      },
    ],
    relatedBlog: [
      { href: '/blog/free-privacy-policy-generator', label: 'Free Privacy Policy Generator: 2026 Guide' },
      { href: '/blog/gdpr-vs-ccpa-difference-developers', label: 'GDPR vs CCPA: What Developers Actually Need to Know' },
    ],
  },
  {
    slug: 'cursor',
    name: 'Cursor',
    h1: 'Privacy Policy Generator for Cursor-Built Apps',
    metaTitle: 'Privacy Policy Generator for Cursor Apps | PrivacyPage',
    metaDescription:
      'Shipped an app with Cursor? Generate its privacy policy in 60 seconds — covers analytics, crash reporting, Firebase, Stripe. Free preview, $9.99 one-time.',
    keyword: 'privacy policy generator for cursor apps',
    tagline:
      'Cursor helped you write the code. The one file it can\'t write from scratch is your privacy policy — this can.',
    intro: [
      `Cursor has collapsed the time between idea and shipped product. Solo developers are now taking full apps — Next.js SaaS, React Native apps, Swift apps — from empty repo to store submission in days. The legal paperwork hasn't gotten faster to match: a privacy policy is still a hard requirement for the App Store, Google Play, Google OAuth verification, and privacy laws like GDPR and CCPA, and an AI editor can't reliably know your legal obligations or your actual data flows.`,
      `That's the gap PrivacyPage fills. Instead of asking an LLM to hallucinate a policy (risky — it will happily invent practices you don't have), you answer ~10 concrete questions about what your app really collects, and get a complete, accurate policy in about 60 seconds. Free to preview in full; <strong>$9.99 once</strong> to unlock. No subscription.`,
    ],
    dataHeading: 'What Cursor-built apps typically collect',
    dataPoints: [
      {
        title: 'Accounts and auth',
        desc: 'Whether you wired Firebase Auth, Supabase, Clerk, or rolled your own — emails, password hashes, and OAuth identities are personal data you control.',
      },
      {
        title: 'Analytics events',
        desc: 'PostHog, Google Analytics, Mixpanel, or Amplitude SDKs collect device data, usage events, and identifiers that must be disclosed.',
      },
      {
        title: 'Crash and error reporting',
        desc: 'Sentry and Crashlytics capture stack traces that often include device identifiers and sometimes user context. Apple\'s privacy labels ask about this explicitly.',
      },
      {
        title: 'Payments and subscriptions',
        desc: 'Stripe, RevenueCat, or store billing process names and payment details on your behalf — disclosed third parties, every one.',
      },
      {
        title: 'AI features',
        desc: 'If your app calls OpenAI, Anthropic, or Gemini APIs, user content leaves your infrastructure and your policy must say so.',
      },
    ],
    requirementsHeading: 'Why "I\'ll add it later" fails review',
    requirements: [
      `<strong>App Store:</strong> App Store Connect will not let you submit without a privacy policy URL, and reviewers cross-check your App Privacy labels against your policy. Mismatches get flagged — our post on <a href="/blog/app-store-rejection-privacy-policy">privacy policy rejections</a> covers the common cases.`,
      `<strong>Google Play:</strong> the Data safety form is mandatory, and a policy URL is required for any app that collects personal data. Play also periodically re-reviews existing listings.`,
      `<strong>GDPR / CCPA / DPDP:</strong> laws apply based on user location. A public app has EU, California, and Indian users by default. Each framework expects specific disclosures — legal bases and rights under <a href="/compliance/gdpr">GDPR</a>, category disclosures under <a href="/compliance/ccpa">CCPA</a>, and notice requirements under India's <a href="/compliance/dpdp">DPDP Act</a>.`,
    ],
    hostingTip:
      'Copy the HTML or Markdown export into your repo — a /privacy route in Next.js, a static page in your marketing site, or a hosted doc for mobile-only apps — and paste the URL into App Store Connect and the Play Console.',
    faqs: [
      {
        q: "Can't I just ask Cursor's AI to write a privacy policy?",
        a: 'You can, but it is risky: LLMs generate plausible-sounding policies that routinely misstate your actual data practices, omit legally required sections, or invent rights processes you don\'t operate. A policy that misrepresents what you do is a liability. PrivacyPage builds the document from your answers about your real stack.',
      },
      {
        q: 'My app is a side project with no revenue. Do I really need this?',
        a: 'If it is on a store or has public sign-ups, yes — store rules and privacy laws do not have a "side project" exemption. The free preview costs nothing, so there is no reason to ship without one.',
      },
      {
        q: 'I ship multiple apps. Does one purchase cover all of them?',
        a: 'Each purchase covers one document set for one app, since the content is customized per app. The $24.99 bundle covers all five document types for a single app.',
      },
      {
        q: 'What formats do I get?',
        a: 'HTML, Markdown, and plain text — drop it into a React route, a docs site, Notion, or anywhere else. You own the document outright.',
      },
    ],
    relatedBlog: [
      { href: '/blog/privacy-policy-for-react-native-app', label: 'Privacy Policy for React Native Apps: Complete Guide' },
      { href: '/blog/how-to-add-privacy-policy-app-store', label: 'How to Add a Privacy Policy to Your App Store Listing' },
    ],
  },
  {
    slug: 'replit',
    name: 'Replit',
    h1: 'Privacy Policy Generator for Replit Apps',
    metaTitle: 'Privacy Policy Generator for Replit Apps | PrivacyPage',
    metaDescription:
      'Built with Replit Agent? Generate a privacy policy for your Replit app in 60 seconds. Covers Replit Auth, DB, deployments. Free preview, $9.99 one-time.',
    keyword: 'privacy policy generator for replit apps',
    tagline:
      'Replit Agent built and deployed your app. Give it the privacy policy it needs before you share the link.',
    intro: [
      `Replit Agent takes you from a prompt to a deployed app on a live replit.app URL — often with Replit Auth logins and a database wired in automatically. That "it just works" magic has a quiet consequence: the moment someone logs in, your app is collecting personal data, and you are the one legally responsible for it. Not Replit — you.`,
      `A privacy policy is the baseline requirement, and it is genuinely easy to get right for a Replit app because the stack is so standard. PrivacyPage generates a policy customized to your app in about 60 seconds: answer a short wizard, preview the entire document free, and pay <strong>$9.99 once</strong> only when you want to unlock the export. No subscription — which matters, because your app might be a weekend experiment, not a business with a software budget.`,
    ],
    dataHeading: 'What your Replit app is probably collecting',
    dataPoints: [
      {
        title: 'Replit Auth profiles',
        desc: "Replit's built-in auth hands you user IDs, names, emails, and profile images. Convenient — but that data is now yours to safeguard and disclose.",
      },
      {
        title: 'Replit Database / PostgreSQL',
        desc: 'Everything users create in your app lives in Replit DB or the built-in Postgres. Your policy states what is stored and your retention approach.',
      },
      {
        title: 'Deployment access logs',
        desc: 'Replit Deployments log request IPs and metadata. IP addresses are personal data under GDPR.',
      },
      {
        title: 'Payments via Stripe',
        desc: 'If Agent wired up Stripe checkout for you, names and billing details flow through Stripe — a third-party processor your policy must name.',
      },
      {
        title: 'AI features and analytics',
        desc: 'Calls to OpenAI or Anthropic send user input to those providers, and any analytics snippet collects usage data. Both need disclosure.',
      },
    ],
    requirementsHeading: 'What you need before sharing your app',
    requirements: [
      `<strong>A linked privacy policy.</strong> The norm — and in many cases the rule — is a policy link in your footer or settings screen. Google OAuth verification requires it, and if you later wrap your app for the App Store or Play Store, the policy URL is mandatory at submission.`,
      `<strong>GDPR-grade disclosures for a global audience.</strong> A replit.app URL is world-readable, so assume EU users. That means naming your processors (Replit, Stripe, AI providers), stating why you collect each data type, and explaining how users can get their data deleted. Our <a href="/compliance/gdpr">GDPR guide</a> breaks this down.`,
      `<strong>Honesty about the stack.</strong> Generic template policies rarely mention Replit Auth or Replit-hosted databases. Your policy should reflect the services actually processing your users' data — that is exactly what the PrivacyPage wizard asks about.`,
    ],
    hostingTip:
      'Copy the HTML export and prompt Replit Agent: "Add a /privacy route serving this HTML and link it in the footer." You\'ll have a live policy URL on your replit.app domain in under a minute.',
    faqs: [
      {
        q: 'Does Replit\'s own privacy policy cover my app?',
        a: 'No. Replit\'s policy covers Replit\'s services to you, the developer. For the app you built, you are the data controller — your users need your policy explaining what your app does with their data.',
      },
      {
        q: 'My app only uses Replit Auth — no database. Do I still need a policy?',
        a: 'Yes. Replit Auth alone gives you access to user emails and profile data, which is personal data collection. The policy for an auth-only app is short, but it still needs to exist.',
      },
      {
        q: 'Can I generate the policy before my app is finished?',
        a: 'Yes — and regenerate it free after launch. Your license includes lifetime regenerations, so evolving from prototype to paid product doesn\'t cost you another fee.',
      },
      {
        q: 'What does the free preview include?',
        a: 'The complete generated document, viewable in full before you pay. The one-time $9.99 payment unlocks download and export in HTML, Markdown, and plain text.',
      },
    ],
    relatedBlog: [
      { href: '/blog/free-privacy-policy-generator', label: 'Free Privacy Policy Generator: 2026 Guide' },
      { href: '/blog/free-terms-of-service-generator', label: 'Free Terms of Service Generator' },
    ],
  },
]

/* ────────────────────────────── /vs/[competitor] ────────────────────────────── */

export const competitorPages: CompetitorPage[] = [
  {
    slug: 'termly',
    name: 'Termly',
    h1: 'PrivacyPage vs Termly: One-Time $9.99 vs a Subscription',
    metaTitle: 'PrivacyPage vs Termly (2026): Pricing & Comparison',
    metaDescription:
      'Termly Pro+ runs $180/year billed annually. PrivacyPage is $9.99 once. Honest 2026 comparison: pricing, features, and when each tool is the right choice.',
    keyword: 'termly alternative',
    tagline:
      'Both generate compliant privacy policies. One bills you every month for it.',
    intro: [
      `Termly is one of the most popular compliance platforms on the web, and deservedly so — it pairs policy generators with a full consent management platform. The catch is the pricing model: meaningful use requires a per-website subscription. As of August 2026, Termly's Pro+ plan is <strong>$15/month billed annually ($180/year), or $20/month billed monthly</strong>, per website (<a href="https://termly.io/pricing/" target="_blank" rel="noopener noreferrer nofollow">termly.io/pricing</a>). The Starter tier is $10/month billed annually, and the free plan covers a single basic policy with Termly branding.`,
      `PrivacyPage takes the opposite approach: you generate the document free, preview all of it, and pay <strong>$9.99 once</strong> to unlock it (or $24.99 for all five document types). You own the file, host it anywhere, and regenerate updates free for life. Over three years that's $9.99 versus $540 for Termly Pro+ — for a developer who needs a policy, not a compliance department.`,
    ],
    pricingSourceNote:
      'Competitor pricing checked August 2026 from termly.io/pricing. Verify current prices before purchasing — plans and promotions change.',
    comparisonRows: [
      { label: 'Price', them: '$10–$15/mo billed annually ($120–$180/yr) per website; $14–$20 billed monthly', us: '$9.99 once per document, or $24.99 once for all 5' },
      { label: '3-year cost', them: '$360–$540 per website (annual billing)', us: '$9.99–$24.99, total' },
      { label: 'Free tier', them: '1 basic policy, Termly branding, 10k banner views', us: 'Full free preview of every document, no account' },
      { label: 'Document ownership', them: 'Termly-hosted; policies live on their infrastructure', us: 'You export HTML/Markdown/text and host anywhere' },
      { label: 'Cookie consent banner', them: 'Yes — full CMP with consent logs, Google Consent Mode v2, IAB TCF', us: 'No — documents only' },
      { label: 'Auto-updating policies', them: 'Yes, on Pro+', us: 'No — free manual regeneration anytime, forever' },
      { label: 'Account required', them: 'Yes', us: 'No' },
      { label: 'INR pricing & UPI', them: 'No', us: 'Yes — geo-priced for India, UPI via Razorpay' },
    ],
    prosThem: [
      {
        title: 'Full consent management platform',
        desc: 'Termly\'s cookie banner, consent logging, Google Consent Mode v2, and IAB TCF support are real infrastructure. If you run EU-targeted advertising, that CMP is worth paying for.',
      },
      {
        title: 'Auto-updated hosted policies',
        desc: 'On Pro+, Termly monitors regulations and updates your hosted policies automatically. Hands-off compliance is genuinely valuable for teams who never want to think about it.',
      },
      {
        title: 'Cookie scanning',
        desc: 'Weekly automated scans keep your cookie disclosures in sync with what your site actually sets.',
      },
    ],
    prosUs: [
      {
        title: 'One-time payment',
        desc: '$9.99 once versus a subscription that costs more every single year you stay live. For a document you need once and touch rarely, renting makes little sense.',
      },
      {
        title: 'You own the document',
        desc: 'Export as HTML, Markdown, or plain text and host it in your own repo. No vendor dependency, no policy that disappears if you stop paying.',
      },
      {
        title: 'Faster, no account',
        desc: 'No signup, ~10 questions, full free preview in about 60 seconds. Termly\'s wizard is more involved and gates features behind the account and plan tiers.',
      },
      {
        title: 'Fair pricing for indie devs worldwide',
        desc: 'Geo-priced INR checkout with UPI for Indian developers — a market where $180/year is a serious expense.',
      },
    ],
    verdict: [
      `Choose <strong>Termly</strong> if you need an ongoing compliance platform: cookie consent banner with logged proof, auto-updating hosted policies, and advertising-grade consent (TCF, Consent Mode v2). That is what the subscription pays for.`,
      `Choose <strong>PrivacyPage</strong> if you need the documents: a privacy policy, terms of service, or full doc set for an app you're shipping. You'll pay $9.99–$24.99 once instead of $120–$180 per year, own the files outright, and regenerate them free when your app changes.`,
    ],
    callout: {
      text: 'Want the deeper dive? We wrote a full guide on switching from Termly, including a step-by-step migration.',
      href: '/blog/termly-alternative-free',
      linkLabel: 'Read: Termly Alternative — Free Privacy Policy Generator',
    },
    faqs: [
      {
        q: 'Is Termly free plan enough for my app?',
        a: 'Termly\'s free plan covers one basic policy with Termly branding and limited edits. For a simple site it may suffice; anything needing multiple documents, edits, or no third-party branding pushes you to Starter ($10/mo annual) or Pro+ ($15/mo annual). PrivacyPage\'s free preview shows your complete document before any payment.',
      },
      {
        q: 'What happens to my Termly policy if I cancel?',
        a: 'Termly hosts your policies, so cancelling means losing the hosted page and its auto-updates. With PrivacyPage you export the document itself — there is nothing to cancel and nothing that expires.',
      },
      {
        q: 'How does PrivacyPage handle law changes without auto-updates?',
        a: 'Your one-time license includes free lifetime regenerations. When laws or your app change, rerun the wizard and regenerate an updated document at no cost. It is manual, but it is free and takes about a minute.',
      },
      {
        q: 'Does PrivacyPage include a cookie consent banner?',
        a: 'No. PrivacyPage generates documents (including a cookie policy). If you need a consent banner with logging for EU advertising, pair it with a dedicated CMP — or use Termly if you want both from one vendor.',
      },
    ],
    relatedBlog: [
      { href: '/blog/termly-alternative-free', label: 'Termly Alternative — Free Privacy Policy Generator (No Subscription)' },
      { href: '/blog/free-privacy-policy-generator', label: 'Free Privacy Policy Generator: 2026 Guide' },
    ],
  },
  {
    slug: 'iubenda',
    name: 'iubenda',
    h1: 'PrivacyPage vs iubenda: $9.99 Once vs Per-Site Subscriptions',
    metaTitle: 'PrivacyPage vs iubenda (2026): Pricing & Comparison',
    metaDescription:
      'iubenda Advanced costs ~$300/year per site; Terms need the $24.99/mo tier. PrivacyPage: $9.99 once. Honest 2026 comparison for app developers.',
    keyword: 'iubenda alternative',
    tagline:
      'A 15-year-old compliance suite versus a 60-second generator. Different tools — very different bills.',
    intro: [
      `iubenda is one of the longest-running players in the compliance space, with a lawyer-crafted clause library and genuinely deep multi-language support. Its pricing is per site and subscription-based. As of August 2026 (<a href="https://www.iubenda.com/en/pricing/" target="_blank" rel="noopener noreferrer nofollow">iubenda.com/en/pricing</a>): <strong>Essentials at $5.99/month billed annually (~$72/year)</strong> covers a privacy and cookie policy in one language; <strong>Advanced at $24.99/month billed annually (~$300/year)</strong> is the first tier that includes Terms &amp; Conditions; <strong>Ultimate runs $99.99/month (~$1,200/year)</strong>. Plans include monthly pageview quotas with overage fees beyond them.`,
      `PrivacyPage charges <strong>$9.99 once</strong> per document or <strong>$24.99 once</strong> for all five — privacy policy, terms of service, EULA, cookie policy, and disclaimer. That bundle costs less, once, than a single month of the iubenda tier you'd need to get Terms &amp; Conditions at all.`,
    ],
    pricingSourceNote:
      'Competitor pricing checked August 2026 from iubenda.com/en/pricing (USD, annual billing). Pageview overages billed separately. Verify current prices before purchasing.',
    comparisonRows: [
      { label: 'Price', them: '$5.99–$99.99/mo billed annually, per site (~$72–$1,200/yr)', us: '$9.99 once per document, or $24.99 once for all 5' },
      { label: 'Terms of Service included', them: 'Only from Advanced (~$300/yr)', us: 'Included in the $24.99 bundle' },
      { label: 'Pageview limits', them: 'Yes — 25k–150k/mo per tier, ~$0.06 per extra 1,000', us: 'None — it\'s your file' },
      { label: 'Multi-language documents', them: 'Yes (Advanced+), excellent', us: 'English only' },
      { label: 'Document ownership', them: 'Embedded/hosted via iubenda; tied to subscription', us: 'Full export — HTML, Markdown, plain text' },
      { label: 'Auto-updates when laws change', them: 'Yes', us: 'No — free manual regeneration, lifetime' },
      { label: 'Account required', them: 'Yes', us: 'No' },
      { label: 'Time to a finished policy', them: 'Clause-by-clause configuration', us: '~60 seconds, ~10 questions' },
    ],
    prosThem: [
      {
        title: 'Lawyer-crafted clause depth',
        desc: 'Thousands of maintained service clauses, updated by an in-house legal team as laws change. For complex, multi-service businesses this depth is real.',
      },
      {
        title: 'Multi-language compliance',
        desc: 'If you need your policy in German, French, Italian, and more — iubenda\'s all-languages support on Advanced+ is best-in-class.',
      },
      {
        title: 'Full suite with consent database',
        desc: 'Cookie solution, consent logging, and a mobile SDK make it a one-stop platform for businesses with EU-facing advertising.',
      },
    ],
    prosUs: [
      {
        title: 'A fraction of the cost',
        desc: 'The $24.99 all-documents bundle is a one-time payment smaller than one month of iubenda Advanced — the tier you need before Terms & Conditions are even included.',
      },
      {
        title: 'No pageview meter',
        desc: 'iubenda plans meter your traffic and bill overages. A PrivacyPage document is a static file; going viral costs you nothing.',
      },
      {
        title: 'Built for shipping fast',
        desc: 'No account, ~10 questions, full free preview. You can go from nothing to a hosted policy inside the same hour you submit to the App Store.',
      },
      {
        title: 'Own it forever',
        desc: 'Cancel iubenda and your embedded policy goes away. A PrivacyPage export lives in your repo permanently, with free regenerations when things change.',
      },
    ],
    verdict: [
      `Choose <strong>iubenda</strong> if you run a multi-language, EU-facing business that wants a maintained compliance suite — clause updates, consent records, cookie banner — and the ~$300/year for the tier that includes all documents is a rounding error for you.`,
      `Choose <strong>PrivacyPage</strong> if you are a developer or indie founder who needs correct, complete legal documents for an app — once, in English, for $9.99–$24.99 total, with no meter running.`,
    ],
    faqs: [
      {
        q: 'Why is iubenda so much more expensive for Terms & Conditions?',
        a: 'iubenda gates Terms & Conditions behind its Advanced tier (~$24.99/month billed annually) because that tier targets businesses. PrivacyPage includes Terms of Service in the $24.99 one-time bundle alongside the privacy policy, EULA, cookie policy, and disclaimer.',
      },
      {
        q: 'Does PrivacyPage have the same legal clause depth?',
        a: 'PrivacyPage covers the disclosures GDPR, CCPA, CalOPPA, and COPPA require, customized to the third-party services you actually use. iubenda\'s clause library is broader for unusual services and jurisdictions — if you run a complex multi-jurisdiction business, that depth may be worth the subscription.',
      },
      {
        q: 'What about iubenda\'s free plan?',
        a: 'iubenda\'s free tier is limited to very low-traffic sites (under ~1,000 pageviews/month) with capped clauses. PrivacyPage\'s free preview is the full document for any app; you pay only to export it.',
      },
      {
        q: 'Can I use PrivacyPage for a client project?',
        a: 'Yes — generate, unlock, and hand the exported files to your client. No per-site subscription to transfer, no seat licensing.',
      },
    ],
    relatedBlog: [
      { href: '/blog/free-privacy-policy-generator', label: 'Free Privacy Policy Generator: 2026 Guide' },
      { href: '/blog/free-terms-of-service-generator', label: 'Free Terms of Service Generator' },
    ],
  },
  {
    slug: 'getterms',
    name: 'GetTerms',
    h1: 'PrivacyPage vs GetTerms: $9.99 Once vs $60/Year or $199 Lifetime',
    metaTitle: 'PrivacyPage vs GetTerms (2026): Pricing Comparison',
    metaDescription:
      'GetTerms runs $60–$96/year per site, or $199–$249 lifetime. PrivacyPage is $9.99 once, $24.99 for all 5 docs. Honest 2026 comparison for developers.',
    keyword: 'getterms alternative',
    tagline:
      'GetTerms is one of the cheaper compliance platforms. PrivacyPage is still an order of magnitude cheaper for documents.',
    intro: [
      `GetTerms deserves credit as one of the more affordable compliance tools — and one of the few that even offers a lifetime option. As of August 2026 (<a href="https://getterms.io/pricing" target="_blank" rel="noopener noreferrer nofollow">getterms.io/pricing</a>): the <strong>Starter plan is $5/month billed annually ($60/year)</strong> per site and covers a privacy policy and cookie banner, but notably <em>not</em> Terms &amp; Conditions. The <strong>Business plan at $8/month billed annually ($96/year)</strong> adds all policies and removes branding. Lifetime licenses cost <strong>$199 (Starter) or $249 (Business)</strong> per site.`,
      `PrivacyPage's whole model is what GetTerms's lifetime tier gestures at, priced for indie developers: <strong>$9.99 once</strong> for a document, <strong>$24.99 once</strong> for all five document types, full free preview first, no account. If what you need is the legal documents — not a hosted consent platform — the math is not close.`,
    ],
    pricingSourceNote:
      'Competitor pricing checked August 2026 from getterms.io/pricing and independent reviews. Promotional lifetime deals (e.g. AppSumo tiers) appear periodically. Verify current prices before purchasing.',
    comparisonRows: [
      { label: 'Price', them: '$5–$8/mo billed annually ($60–$96/yr) per site; $9–$12 monthly', us: '$9.99 once per document, or $24.99 once for all 5' },
      { label: 'Lifetime option', them: '$199 (Starter) / $249 (Business) per site', us: 'Every purchase is effectively lifetime — $9.99–$24.99' },
      { label: 'Terms & Conditions', them: 'Business plan only', us: 'Included in the $24.99 bundle' },
      { label: 'Cookie consent banner', them: 'Yes, with unlimited views and Consent Mode v2', us: 'No — documents only' },
      { label: 'Branding on documents', them: 'GetTerms branding on Starter', us: 'None — the document is yours' },
      { label: 'Regulation monitoring alerts', them: 'Yes, on Business', us: 'No — free manual regeneration anytime' },
      { label: 'Account required', them: 'Yes', us: 'No' },
      { label: 'INR pricing & UPI', them: 'No', us: 'Yes — geo-priced for India via Razorpay' },
    ],
    prosThem: [
      {
        title: 'Bundled cookie consent banner',
        desc: 'GetTerms includes a CMP with unlimited banner views and Google Consent Mode v2 on all plans — genuinely good value if you need consent management, since most rivals meter views.',
      },
      {
        title: 'Regulation monitoring',
        desc: 'The Business plan watches for law changes and alerts you — useful if you want prompted updates rather than remembering to regenerate.',
      },
      {
        title: 'A real lifetime option',
        desc: 'Unlike most subscription-only competitors, GetTerms lets you pay once ($199–$249/site) and be done. We respect that.',
      },
    ],
    prosUs: [
      {
        title: '8–25x cheaper for documents',
        desc: 'GetTerms\'s cheapest lifetime tier is $199 per site. PrivacyPage\'s all-documents bundle is $24.99 once — and a single privacy policy is $9.99.',
      },
      {
        title: 'Terms included without upgrading',
        desc: 'GetTerms holds Terms & Conditions back for its Business plan. The PrivacyPage bundle includes ToS, EULA, cookie policy, and disclaimer alongside the privacy policy.',
      },
      {
        title: 'No account, instant preview',
        desc: 'Preview the complete document before paying anything, with no signup. GetTerms\'s free tier produces a branded basic policy and requires an account.',
      },
      {
        title: 'Own the file',
        desc: 'Export HTML, Markdown, or plain text and commit it to your repo. Nothing hosted, nothing to migrate later.',
      },
    ],
    verdict: [
      `Choose <strong>GetTerms</strong> if you want a hosted compliance platform with a cookie consent banner and update alerts at one of the lower subscription prices in the category — or its lifetime tier if you run one site long-term and want the CMP included.`,
      `Choose <strong>PrivacyPage</strong> if you need the documents themselves for an app you're launching: $9.99–$24.99 once, all document types, no branding, no account, and free regenerations for life.`,
    ],
    faqs: [
      {
        q: 'GetTerms has a lifetime plan too — how is PrivacyPage different?',
        a: 'Scope and price. GetTerms lifetime ($199–$249 per site) buys their hosted platform: policies plus cookie banner and updates. PrivacyPage sells the documents: $9.99 for one or $24.99 for all five, exported as files you own, with free manual regenerations. If you don\'t need a hosted CMP, you\'re paying roughly 8x more at GetTerms for the same core documents.',
      },
      {
        q: 'Is the GetTerms free policy enough for an app store submission?',
        a: 'It can satisfy the URL requirement, but the free tier carries GetTerms branding and covers only a basic privacy policy — no terms, limited customization. Store reviewers care most that the policy accurately reflects your data practices, which is where a customized document matters.',
      },
      {
        q: 'Does PrivacyPage include a cookie banner like GetTerms?',
        a: 'No — PrivacyPage generates documents, including a cookie policy, but not a consent banner widget. If your site needs GDPR consent management for advertising cookies, pair the documents with a dedicated CMP.',
      },
      {
        q: 'Which is better for a mobile app?',
        a: 'Mobile apps rarely need a web cookie banner — they need accurate policy documents for App Store and Play Store submission. That is PrivacyPage\'s home turf: store-ready documents in 60 seconds for $9.99.',
      },
    ],
    relatedBlog: [
      { href: '/blog/free-privacy-policy-generator-ios-apps', label: 'Free Privacy Policy Generator for iOS Apps' },
      { href: '/blog/how-to-add-privacy-policy-app-store', label: 'How to Add a Privacy Policy to Your App Store Listing' },
    ],
  },
  {
    slug: 'termageddon',
    name: 'Termageddon',
    h1: 'PrivacyPage vs Termageddon: $9.99 Once vs $119 Every Year',
    metaTitle: 'PrivacyPage vs Termageddon (2026): Comparison',
    metaDescription:
      'Termageddon costs $119/year per website, subscription only. PrivacyPage is $9.99 once. Honest 2026 comparison — including where Termageddon is stronger.',
    keyword: 'termageddon alternative',
    tagline:
      'Termageddon sells auto-updating policies as a service. PrivacyPage sells you the policy.',
    intro: [
      `Termageddon has a clear, single-tier offer: <strong>$12/month or $119/year per website</strong> (as of August 2026 — <a href="https://termageddon.com/pricing/" target="_blank" rel="noopener noreferrer nofollow">termageddon.com/pricing</a>), which includes its full policy suite — privacy policy, terms &amp; conditions, disclaimer, EULA, cookie policy — plus a cookie consent tool. Its headline feature is genuinely distinctive: policies are embedded via their API and <strong>update automatically when privacy laws change</strong>, with an attorney-led team monitoring 120+ laws. There is no lifetime or one-time option.`,
      `PrivacyPage covers the same document set for <strong>$24.99 once</strong> (or $9.99 for a single document). You export and own the files, and when laws or your app change you regenerate free — manually rather than automatically. Over five years that's $24.99 versus $595. Whether Termageddon's automation is worth the recurring difference is the honest question, and the answer depends on who you are.`,
    ],
    pricingSourceNote:
      'Competitor pricing checked August 2026 from termageddon.com/pricing. Verify current prices before purchasing.',
    comparisonRows: [
      { label: 'Price', them: '$12/mo or $119/yr per website, subscription only', us: '$9.99 once per document, or $24.99 once for all 5' },
      { label: '5-year cost', them: '$595 per website', us: '$24.99, total' },
      { label: 'Documents included', them: 'Privacy policy, T&C, disclaimer, EULA, cookie policy', us: 'Privacy policy, ToS, disclaimer, EULA, cookie policy' },
      { label: 'Auto-updates on law changes', them: 'Yes — embedded policies update automatically', us: 'No — free manual regeneration anytime' },
      { label: 'Cookie consent tool', them: 'Included', us: 'No — documents only' },
      { label: 'Document ownership', them: 'Embedded via Termageddon; requires active license', us: 'Full export — HTML, Markdown, plain text' },
      { label: 'Free tier / preview', them: 'No free tier', us: 'Full document preview free, no account' },
      { label: 'One-time purchase option', them: 'No', us: 'That\'s the whole model' },
    ],
    prosThem: [
      {
        title: 'True hands-off auto-updates',
        desc: 'Termageddon\'s core pitch is real: embed their policy and it rewrites itself as laws change, backed by an attorney-founded team tracking 120+ privacy laws. For businesses that will never remember to update, this is the feature.',
      },
      {
        title: 'Everything in one license',
        desc: 'One flat price includes all policy types and a cookie consent tool — simpler than the tiered upsells most competitors run.',
      },
      {
        title: 'Strong agency program',
        desc: 'Web agencies managing many client sites get bulk licensing and their own policies free — a well-designed reseller model.',
      },
    ],
    prosUs: [
      {
        title: '$24.99 once vs $119 forever',
        desc: 'Termageddon has no way to stop paying. If your app lives five years, the same documents cost 24x more. PrivacyPage\'s regenerations are manual, but they are free and take a minute.',
      },
      {
        title: 'You hold the files',
        desc: 'Termageddon policies are embedded from their servers — stop paying and your legal pages go blank. A PrivacyPage export is a static file in your repo that can never be turned off.',
      },
      {
        title: 'Try before paying anything',
        desc: 'Termageddon has no free tier. PrivacyPage shows you the complete generated document before you decide.',
      },
      {
        title: 'Priced for indie developers',
        desc: 'Geo-priced INR checkout with UPI support. $119/year is a business expense; $24.99 once is an indie-hacker expense.',
      },
    ],
    verdict: [
      `Choose <strong>Termageddon</strong> if you run a business website you intend to never think about again — its attorney-monitored auto-updates genuinely deliver set-and-forget compliance, and $119/year is fair for that service. Agencies managing client sites should look at it seriously.`,
      `Choose <strong>PrivacyPage</strong> if you're a developer shipping an app and you want correct documents now, owned outright, for a one-time $9.99–$24.99 — accepting that when laws change meaningfully, you regenerate the document yourself (free).`,
    ],
    faqs: [
      {
        q: 'How often do privacy laws actually change enough to matter?',
        a: 'Significant changes that require policy updates happen every year or two — new state laws in the US, amendments like CPRA, or new acts like India\'s DPDP. With PrivacyPage you regenerate free when that happens; with Termageddon it happens automatically. The question is whether that automation is worth ~$119 every year for your situation.',
      },
      {
        q: 'What happens to my Termageddon policy if I cancel?',
        a: 'Termageddon policies are served via embed from their platform, so an inactive license means the policy stops displaying. PrivacyPage exports are static files you own — there is nothing to cancel.',
      },
      {
        q: 'Does PrivacyPage cover the same document types as Termageddon?',
        a: 'Yes — both cover the same five core documents: privacy policy, terms, disclaimer, EULA, and cookie policy. Termageddon additionally bundles a cookie consent banner tool, which PrivacyPage does not include.',
      },
      {
        q: 'Is Termageddon\'s attorney involvement a legal advantage?',
        a: 'Termageddon was founded by a privacy attorney and its update decisions have legal oversight, which is a fair strength. PrivacyPage templates follow the same regulatory requirements (GDPR, CCPA, CalOPPA, COPPA), and for high-stakes or regulated businesses we recommend a lawyer review whichever tool you use.',
      },
    ],
    relatedBlog: [
      { href: '/blog/free-privacy-policy-generator', label: 'Free Privacy Policy Generator: 2026 Guide' },
      { href: '/blog/gdpr-privacy-policy-template-2026', label: 'GDPR Privacy Policy Template (2026)' },
    ],
  },
  {
    slug: 'freeprivacypolicy',
    name: 'FreePrivacyPolicy',
    h1: 'PrivacyPage vs FreePrivacyPolicy.com: What "Free" Actually Costs',
    metaTitle: 'PrivacyPage vs FreePrivacyPolicy.com (2026)',
    metaDescription:
      'FreePrivacyPolicy\'s free tier is basic; premium clauses are à-la-carte one-time fees that add up. PrivacyPage: full doc, $9.99 flat. 2026 comparison.',
    keyword: 'freeprivacypolicy alternative',
    tagline:
      'Both offer free policies and one-time payments. The difference is what the free version leaves out — and how the paid version is priced.',
    intro: [
      `FreePrivacyPolicy.com is one of the oldest and best-known policy generators, and to its credit it shares PrivacyPage's core belief: legal documents should be a one-time purchase, not a subscription. Its free tier produces a genuinely free but basic policy. The paid model is <strong>à-la-carte</strong>: premium clauses are individual one-time fees — for example, clauses for payment processors, analytics tools like Google Analytics or Firebase, remarketing, and GDPR/CCPA coverage are each priced separately (per their <a href="https://www.freeprivacypolicy.com/" target="_blank" rel="noopener noreferrer nofollow">site</a>). Independent 2026 reviews put a comprehensive premium policy at roughly <strong>$47–$197 one-time</strong> depending on the clauses selected.`,
      `PrivacyPage flattens all of that: <strong>$9.99 once</strong> buys the complete document — GDPR and CCPA sections, all your third-party services, everything — with the entire document previewable free before you pay. No clause menu, no surprise line items at checkout.`,
    ],
    pricingSourceNote:
      'FreePrivacyPolicy.com prices premium clauses individually (one-time fees per clause/module); totals vary by selection. Range cited from independent reviews, August 2026. Verify current prices on their site.',
    comparisonRows: [
      { label: 'Pricing model', them: 'Free basic policy; premium clauses priced individually (one-time)', us: 'Flat $9.99 once per document, $24.99 for all 5' },
      { label: 'Typical paid total', them: '~$47–$197 depending on clauses (per 2026 reviews)', us: '$9.99, fixed and known upfront' },
      { label: 'GDPR / CCPA sections', them: 'Paid add-on clauses', us: 'Included' },
      { label: 'Third-party service clauses', them: 'Priced per clause (e.g. analytics, payments, ads)', us: 'Included — the wizard asks what you use' },
      { label: 'Free tier', them: 'Yes — basic policy, limited compliance coverage', us: 'Full document preview, free, no account' },
      { label: 'Other document types', them: 'Separate generators, separately priced', us: 'All 5 in the $24.99 bundle' },
      { label: 'Subscription', them: 'None — one-time fees', us: 'None — one-time' },
      { label: 'Auto-updates', them: 'Hosted policy revisions applied to hosted version', us: 'Free manual regeneration, lifetime' },
    ],
    prosThem: [
      {
        title: 'A genuinely free basic policy',
        desc: 'If your site collects almost nothing and you just need a simple, hosted policy page, the free tier is real and has served millions of sites.',
      },
      {
        title: 'One-time payments, like us',
        desc: 'No subscription anywhere — a philosophy we obviously agree with. Their hosted policies also receive revisions.',
      },
      {
        title: 'Long track record',
        desc: 'Operating for well over a decade with an enormous install base. It is a known quantity.',
      },
    ],
    prosUs: [
      {
        title: 'One flat price, no clause menu',
        desc: 'FreePrivacyPolicy prices GDPR clauses, analytics clauses, payment processor clauses, and remarketing clauses individually — a comprehensive policy commonly lands between $47 and $197. PrivacyPage is $9.99, period, and you knew that before you started.',
      },
      {
        title: 'Free means the full document',
        desc: 'Their free tier omits the compliance sections most apps need. Our free preview is the complete document including GDPR/CCPA sections — you pay only to export it.',
      },
      {
        title: 'Built for apps, not just websites',
        desc: 'The wizard is designed around app stacks — auth providers, mobile SDKs, AI APIs, crash reporting — producing App Store and Play Store ready documents.',
      },
      {
        title: 'Modern, 60-second flow',
        desc: 'No account, about ten questions, done. Reviewers consistently describe FreePrivacyPolicy\'s interface as dated with a longer path to a finished policy.',
      },
    ],
    verdict: [
      `Choose <strong>FreePrivacyPolicy.com</strong> if you have a simple website with minimal data collection and the basic free policy honestly covers your practices — it is a legitimate free option with a long history.`,
      `Choose <strong>PrivacyPage</strong> if you're shipping an app that uses real services — auth, analytics, payments, AI — and want every required clause in one document for a flat $9.99, instead of assembling it from à-la-carte add-ons that can total 5–20x more.`,
    ],
    faqs: [
      {
        q: 'Is the FreePrivacyPolicy free policy legally sufficient?',
        a: 'For a static site collecting nearly nothing, possibly. Its free tier is widely noted to lack the GDPR and CCPA depth most modern apps need — those are paid clause add-ons. If your app has accounts or analytics, budget for the premium clauses or use a flat-price generator.',
      },
      {
        q: 'Both are one-time payments — why is PrivacyPage cheaper?',
        a: 'Pricing structure. FreePrivacyPolicy monetizes per clause: each analytics tool, payment processor, or compliance framework adds a fee, so realistic totals reach $47–$197. PrivacyPage charges one flat $9.99 for the complete customized document regardless of how many services you use.',
      },
      {
        q: 'Can I see exactly what I\'m getting before paying?',
        a: 'With PrivacyPage, yes — the full generated document is previewable free, no account. That is the safest way to judge any generator: read the actual output before paying.',
      },
      {
        q: 'What if I need terms of service and a cookie policy too?',
        a: 'FreePrivacyPolicy offers those as separate generators with their own fees. PrivacyPage\'s $24.99 bundle covers all five document types — privacy policy, ToS, EULA, cookie policy, and disclaimer — in one payment.',
      },
    ],
    relatedBlog: [
      { href: '/blog/free-privacy-policy-generator', label: 'Free Privacy Policy Generator: 2026 Guide' },
      { href: '/blog/cookie-policy-guide', label: 'Cookie Policy Guide: Do You Need One?' },
    ],
  },
]

/* ────────────────────────────── /compliance/[regulation] ────────────────────────────── */

export const regulationPages: RegulationPage[] = [
  {
    slug: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation (EU)',
    h1: 'GDPR Privacy Policy Requirements, in Plain English',
    metaTitle: 'GDPR Privacy Policy Requirements: Plain-English Guide',
    metaDescription:
      'What GDPR actually requires in your privacy policy — legal bases, user rights, retention, transfers — explained for developers. Checklist + generator.',
    keyword: 'gdpr privacy policy requirements',
    tagline:
      'What the EU\'s privacy law actually demands from your privacy policy — without the legalese.',
    intro: [
      `The GDPR (General Data Protection Regulation) is the EU's privacy law, in force since May 2018, and the single most influential privacy regulation in the world. Here is the part developers most often get wrong: <strong>it applies based on where your users are, not where you are</strong>. If your app is publicly available and someone in the EU can sign up, GDPR applies to you — whether you're in Austin, Bangalore, or Berlin.`,
      `"Personal data" under GDPR is broad: names and emails, obviously, but also IP addresses, device identifiers, location data, and analytics cookies. If your app has accounts, server logs, or an analytics SDK, you are processing personal data.`,
      `Your privacy policy is how you satisfy GDPR's <strong>transparency obligations</strong> (Articles 12–14). The regulation is unusually specific about what the policy must contain: who you are and how to contact you; every purpose you process data for and the <strong>legal basis</strong> for each (consent, contract, legitimate interests, or legal obligation); who you share data with — including processors like your hosting provider, analytics tool, and payment processor; whether data leaves the EU and under what safeguards; <strong>how long</strong> you keep each category of data; and the full list of user rights — access, rectification, erasure ("right to be forgotten"), restriction, portability, objection, and the right to withdraw consent and to complain to a supervisory authority.`,
      `Article 12 also regulates <em>how</em> you write it: "concise, transparent, intelligible and easily accessible, using clear and plain language." A wall of copy-pasted legalese that doesn't match your actual practices fails both the letter and the spirit. Enforcement is real — fines reach €20 million or 4% of global annual revenue, whichever is higher, and regulators have fined small businesses, not just Big Tech.`,
      `The practical upshot for a developer: list what you actually collect, name the services you actually use, pick honest legal bases, state real retention periods, and explain how users exercise their rights. That is exactly the structure a good generator builds for you.`,
    ],
    checklistHeading: 'GDPR privacy policy checklist',
    checklist: [
      'Your identity and contact details (and EU representative or DPO, if you have one)',
      'Every category of personal data you collect — including IPs, device IDs, and analytics data',
      'The purpose of each processing activity, each tied to a legal basis (Art. 6)',
      'If you rely on legitimate interests: what those interests are',
      'Third parties and processors who receive data (hosting, analytics, payments, AI APIs)',
      'International data transfers and the safeguards used (e.g. Standard Contractual Clauses)',
      'Retention periods — or the criteria used to determine them — per data category',
      'User rights: access, rectification, erasure, restriction, portability, objection',
      'The right to withdraw consent at any time, and how',
      'The right to lodge a complaint with a supervisory authority',
      'Whether automated decision-making or profiling occurs, with meaningful logic explained',
      'Written in clear, plain language and reachable from every page (footer link)',
    ],
    coverage: [
      {
        title: 'Legal bases mapped for you',
        desc: 'The wizard asks what you collect and why, then assigns appropriate legal bases per purpose — the part of GDPR drafting developers find hardest.',
      },
      {
        title: 'Your real processors, disclosed',
        desc: 'Tell it you use Supabase, Stripe, Google Analytics, or OpenAI, and the generated policy names them with the correct disclosure language.',
      },
      {
        title: 'All eight user rights, spelled out',
        desc: 'Access, rectification, erasure, restriction, portability, objection, consent withdrawal, and complaint rights — with instructions users can actually follow.',
      },
      {
        title: 'Retention and transfer sections included',
        desc: 'Generated policies state retention approaches and international transfer safeguards, the two sections most template policies silently omit.',
      },
    ],
    faqs: [
      {
        q: 'Does GDPR apply to my app if I\'m not in the EU?',
        a: 'Yes, if you offer your app to people in the EU or monitor their behavior (which analytics does). A publicly available app that EU users can sign up for is generally in scope regardless of where you\'re based.',
      },
      {
        q: 'Do I need a Data Protection Officer (DPO)?',
        a: 'Most indie apps don\'t. A DPO is required only for public authorities or where core activities involve large-scale systematic monitoring or large-scale processing of sensitive data. If that\'s you, get specialist advice.',
      },
      {
        q: 'Is a generated privacy policy GDPR compliant on its own?',
        a: 'A policy satisfies GDPR\'s transparency requirement — but only if it accurately reflects your practices, which is why the generator asks about your real stack. Full GDPR compliance also involves behavior: honoring deletion requests, securing data, and only collecting what you need. For high-risk processing, have a lawyer review.',
      },
      {
        q: 'What is the fine for not having a compliant policy?',
        a: 'Transparency violations fall under GDPR\'s upper fine tier: up to €20 million or 4% of global annual turnover, whichever is higher. In practice, first actions against small businesses are usually orders to fix plus smaller fines — but "usually" is not a strategy.',
      },
    ],
    relatedBlog: [
      { href: '/blog/gdpr-privacy-policy-template-2026', label: 'GDPR Privacy Policy Template (2026)' },
      { href: '/blog/gdpr-vs-ccpa-difference-developers', label: 'GDPR vs CCPA: What Developers Actually Need to Know' },
    ],
  },
  {
    slug: 'ccpa',
    name: 'CCPA',
    fullName: 'California Consumer Privacy Act (as amended by CPRA)',
    h1: 'CCPA Privacy Policy Requirements, in Plain English',
    metaTitle: 'CCPA Privacy Policy Requirements: Plain-English Guide',
    metaDescription:
      'What the CCPA/CPRA requires in your privacy policy — thresholds, category disclosures, consumer rights, Do Not Sell links — explained for app developers.',
    keyword: 'ccpa privacy policy requirements',
    tagline:
      'California\'s privacy law, decoded for developers — who it covers, what your policy must say, and what to skip.',
    intro: [
      `The CCPA (California Consumer Privacy Act), significantly expanded by the CPRA in 2023, is the United States' most consequential privacy law. Unlike GDPR, it doesn't apply to everyone: it covers <strong>for-profit businesses</strong> that do business in California and meet at least one threshold — roughly <strong>$25 million+ in annual revenue</strong> (inflation-adjusted), buying/selling/sharing personal information of <strong>100,000+ California consumers or households</strong> per year, or earning <strong>50%+ of revenue from selling or sharing</strong> personal information.`,
      `Most indie apps are below those thresholds. So why care? Three reasons. First, growth: 100,000 California users arrives faster than you think, and retrofitting compliance is painful. Second, ecosystem pressure: app stores, ad networks, and enterprise customers increasingly expect CCPA-style disclosures regardless of your size. Third, California is rarely alone — a dozen-plus US states now have similar laws with lower or different thresholds, and a CCPA-grade policy substantially covers them.`,
      `If CCPA applies, your privacy policy must disclose, for the past 12 months: the <strong>categories of personal information</strong> you collected (using the law's categories — identifiers, commercial information, internet activity, geolocation, inferences, and so on); the <strong>sources</strong> of that information; the <strong>business purposes</strong> for collecting it; and the categories of third parties you <strong>disclosed, sold, or shared</strong> it with. "Sharing" notably includes giving data to ad networks for cross-context behavioral advertising — many apps "share" under CCPA without ever selling anything.`,
      `The policy must also explain California consumers' rights: to <strong>know</strong> what you've collected, to <strong>delete</strong> it, to <strong>correct</strong> it, to <strong>opt out of sale or sharing</strong>, to <strong>limit use of sensitive personal information</strong>, and to be free from discrimination for exercising any of these. If you sell or share data, you need a "Do Not Sell or Share My Personal Information" link, and you must honor Global Privacy Control (GPC) browser signals. The policy must state how to submit requests (at least two methods) and be updated at least every 12 months.`,
    ],
    checklistHeading: 'CCPA privacy policy checklist',
    checklist: [
      'Categories of personal information collected in the past 12 months (using CCPA categories)',
      'Sources of each category (directly from users, automatically, from third parties)',
      'Business or commercial purposes for collection, use, and sharing',
      'Categories of third parties data is disclosed to, sold to, or shared with',
      'Whether you sell or share personal information — stated explicitly, even if the answer is no',
      'Consumer rights: know, delete, correct, opt out of sale/sharing, limit sensitive PI, non-discrimination',
      'At least two methods to submit requests (e.g. email and a web form)',
      '"Do Not Sell or Share My Personal Information" link — if you sell or share',
      'Recognition of Global Privacy Control (GPC) signals — if you sell or share',
      'Retention periods or criteria for each category of personal information',
      'A "last updated" date, refreshed at least every 12 months',
    ],
    coverage: [
      {
        title: 'CCPA category mapping',
        desc: 'The wizard translates your plain-English answers into the CCPA\'s formal categories — identifiers, internet activity, geolocation, inferences — so the disclosures use the language the law expects.',
      },
      {
        title: 'Sale/sharing handled honestly',
        desc: 'Most indie apps don\'t sell data. Your generated policy states that explicitly — which the CCPA requires — and includes opt-out language only when your answers indicate you actually share for advertising.',
      },
      {
        title: 'All consumer rights included',
        desc: 'Know, delete, correct, opt out, limit sensitive PI, and non-discrimination — with request instructions and response timelines spelled out.',
      },
      {
        title: 'Paired with GDPR coverage',
        desc: 'Generated policies include both CCPA and GDPR sections, which together substantially cover most other US state privacy laws too.',
      },
    ],
    faqs: [
      {
        q: 'My app is small — do I need CCPA disclosures at all?',
        a: 'Legally, only if you meet a threshold (~$25M revenue, 100k+ CA consumers, or 50%+ revenue from data sales). Practically, including CCPA-style disclosures costs nothing, future-proofs your growth, and satisfies partners and stores that expect them. PrivacyPage includes them by default.',
      },
      {
        q: 'What counts as "selling" data under CCPA?',
        a: 'Broader than cash sales: any transfer of personal information to a third party for valuable consideration. "Sharing" is broader still — passing data to ad networks for cross-context behavioral advertising counts, which is why apps with third-party ad SDKs often need the opt-out link.',
      },
      {
        q: 'Do I need a "Do Not Sell or Share" link?',
        a: 'Only if you sell or share personal information as the CCPA defines it. If you run no third-party advertising and don\'t sell data, you state that in your policy instead — explicitly.',
      },
      {
        q: 'How is CCPA different from GDPR?',
        a: 'GDPR applies to nearly everyone touching EU data and requires legal bases before processing; CCPA applies only above thresholds and focuses on disclosure and opt-out rights after collection. A well-built policy covers both — see our GDPR vs CCPA developer guide for the full breakdown.',
      },
    ],
    relatedBlog: [
      { href: '/blog/gdpr-vs-ccpa-difference-developers', label: 'GDPR vs CCPA: What Developers Actually Need to Know' },
      { href: '/blog/free-privacy-policy-generator', label: 'Free Privacy Policy Generator: 2026 Guide' },
    ],
  },
  {
    slug: 'dpdp',
    name: 'DPDP Act',
    fullName: 'Digital Personal Data Protection Act, 2023 (India)',
    h1: 'India\'s DPDP Act: Privacy Policy Requirements Explained',
    metaTitle: 'DPDP Act Privacy Policy Requirements (India, 2026)',
    metaDescription:
      'India\'s DPDP Act 2023 explained for app developers — notice requirements, consent rules, user rights, penalties up to ₹250 crore. Checklist + generator.',
    keyword: 'dpdp act privacy policy requirements',
    tagline:
      'India\'s first comprehensive data protection law is here. If your app has Indian users, this is what your privacy notice must do.',
    intro: [
      `The <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> is India's first comprehensive data protection law — passed in August 2023, with the implementing <strong>DPDP Rules notified in November 2025</strong> and obligations phasing in on a staggered timeline through 2027. If you build apps and have Indian users, this law applies to you: it covers digital personal data processed in India, and processing anywhere in the world connected to offering goods or services to people in India.`,
      `The Act's vocabulary differs from GDPR's. You are a <strong>Data Fiduciary</strong> (the entity deciding why and how data is processed); your user is a <strong>Data Principal</strong>. The law is consent-centric: with narrow exceptions ("legitimate uses" like data voluntarily provided for a specified purpose, or legal obligations), you process personal data only with consent that is <strong>free, specific, informed, unconditional, and unambiguous</strong>, given by clear affirmative action. Pre-ticked boxes and bundled consent don't qualify.`,
      `The privacy-policy-shaped obligation is the <strong>notice</strong> (Section 5): before or at the moment you request consent, you must give users a notice with an <strong>itemized description of the personal data</strong> you want and the <strong>specified purpose</strong> for each item, how they can exercise their rights and withdraw consent, and how to complain to the <strong>Data Protection Board of India</strong>. Under the 2025 Rules, the notice must be understandable independently — plain language, no burying — and users must be able to access it in <strong>English or any of the 22 languages</strong> in India's Eighth Schedule.`,
      `Users get enforceable rights: to <strong>access a summary</strong> of their data and processing, to <strong>correction and erasure</strong>, to <strong>grievance redressal</strong> with your response required within set timelines, and to <strong>nominate</strong> someone to exercise their rights if they die or are incapacitated. Two provisions bite hardest for apps: processing a child's data (under 18) requires <strong>verifiable parental consent</strong>, with tracking and behavioral advertising directed at children prohibited; and withdrawal of consent must be <strong>as easy as giving it</strong>.`,
      `Penalties are serious — up to <strong>₹250 crore</strong> (about $30 million) per violation for failures like inadequate security safeguards. For most developers, though, the first step is simple and cheap: an accurate privacy notice that itemizes your data collection, states purposes, and explains rights. That is precisely what PrivacyPage generates — built by an Indian developer, priced in INR, payable by UPI.`,
    ],
    checklistHeading: 'DPDP Act privacy notice checklist',
    checklist: [
      'Itemized list of the personal data you collect (not vague categories)',
      'The specified purpose for each item of personal data',
      'Consent requested by clear affirmative action — no pre-ticked boxes or bundling',
      'How users withdraw consent, with withdrawal as easy as giving consent',
      'How users exercise rights: access summary, correction, erasure, nomination',
      'Your grievance redressal mechanism and response commitment',
      'How to complain to the Data Protection Board of India',
      'Notice available in English or any Eighth Schedule language your users need',
      'Verifiable parental consent flow if users under 18 are possible',
      'No tracking or behavioral advertising directed at children',
      'Data deletion when the purpose is served or consent withdrawn (retention limits)',
      'Contact details of your Data Protection Officer, if you\'re a Significant Data Fiduciary',
    ],
    coverage: [
      {
        title: 'Itemized, purpose-tied disclosures',
        desc: 'The generator\'s question flow naturally produces the itemized data-and-purpose structure the DPDP notice requires — not the vague "we may collect certain information" boilerplate that fails it.',
      },
      {
        title: 'Rights and grievance sections built in',
        desc: 'Generated policies explain access, correction, erasure, and grievance redressal with concrete contact instructions — the DPDP\'s core user-facing requirements.',
      },
      {
        title: 'Made in India, priced for India',
        desc: 'PrivacyPage is built by an Indian indie developer. Pricing is geo-adjusted to INR with UPI, netbanking, and cards via Razorpay — no $180/year dollar subscriptions.',
      },
      {
        title: 'One document, three frameworks',
        desc: 'Your generated policy covers DPDP-relevant disclosures alongside GDPR and CCPA sections — one document for a global user base including India.',
      },
    ],
    faqs: [
      {
        q: 'My company is outside India but has Indian users. Does the DPDP Act apply?',
        a: 'Yes — the Act expressly covers processing outside India if it is connected to offering goods or services to people in India. A publicly available app with Indian sign-ups is the textbook case.',
      },
      {
        q: 'When do I actually need to comply?',
        a: 'The Act passed in 2023 and the DPDP Rules were notified in November 2025 with phased timelines: some provisions took effect immediately, while core obligations like notice requirements phase in over roughly 18 months from notification. Building the notice now is cheap; retrofitting consent flows later is not.',
      },
      {
        q: 'How is the DPDP Act different from GDPR?',
        a: 'DPDP is more consent-centric — there is no broad "legitimate interests" basis like GDPR\'s. It sets the child threshold at under 18 (GDPR: 13–16), requires notices available in Indian languages, and its penalties are caps per violation (up to ₹250 crore) rather than revenue percentages. If you\'re GDPR-ready you have a head start, but the notice requirements are not identical.',
      },
      {
        q: 'What is a Significant Data Fiduciary?',
        a: 'A designation the government can apply based on factors like data volume and sensitivity, triggering extra duties — a Data Protection Officer based in India, independent audits, and periodic impact assessments. Typical indie apps are unlikely to be designated, but high-volume consumer apps should watch this.',
      },
    ],
    relatedBlog: [
      { href: '/blog/privacy-policy-app-india', label: 'Do I Need a Privacy Policy for My App in India?' },
      { href: '/blog/gdpr-vs-ccpa-difference-developers', label: 'GDPR vs CCPA: What Developers Actually Need to Know' },
    ],
  },
]

/* ────────────────────────────── helpers ────────────────────────────── */

export function getBuilderPage(slug: string): BuilderPage | undefined {
  return builderPages.find((p) => p.slug === slug)
}

export function getCompetitorPage(slug: string): CompetitorPage | undefined {
  return competitorPages.find((p) => p.slug === slug)
}

export function getRegulationPage(slug: string): RegulationPage | undefined {
  return regulationPages.find((p) => p.slug === slug)
}

export function buildFaqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
