# PrivacyPage — Cursor Handoff

## What Is This?
PrivacyPage (privacypage.io) is a legal document generator for app/web developers. Users fill a short wizard form, preview the document, and pay to unlock the full copy. Revenue model: one-time payments via Razorpay.

**Live URL:** https://privacypage.io  
**Stack:** Next.js 15 (App Router) + Tailwind CSS v4 + Razorpay  
**Hosting:** Vercel  
**Domain:** privacypage.io

---

## What We Just Changed (March 9, 2026)

### 1. Full Redesign: Dark → Light
- Was: Dark mode (#09090b), glassmorphic cards, indigo gradient text — generic AI slop
- Now: Clean light theme, white/gray backgrounds, indigo-600 accents, soft shadows
- Files: `globals.css`, `page.tsx`, `Wizard.tsx`, `PolicyPreview.tsx`, all blog pages

### 2. Removed Fake Testimonials
- Killed fake names (Alex Chen, Sarah Martinez, etc.) and inflated stats ("2,000+ docs generated")
- Replaced with indie developer angle: "Built by Rushiraj" with link to rushiraj.me

### 3. New Components
- `src/components/Logo.tsx` — Shield/checkmark SVG logo (replaces generic "P" box)
- `src/components/Icons.tsx` — Full SVG icon system (9 icons, Heroicons-style)
- `src/components/Illustrations.tsx` — Hero illustration, security shield, document, success, platform logos (all inline SVG)
- `src/components/FadeInView.tsx` — Intersection Observer fade-in wrapper (SSR-safe: content visible before hydration)
- `src/app/icon.svg` — New favicon (shield/checkmark)

### 4. New Sections on Homepage (`page.tsx`)
- **Hero**: Two-column layout (text left, illustration right with floating animation)
- **"How It Works"**: 3-step flow (Choose → Answer → Get docs) with connecting line
- **Features**: SVG icons in indigo-50 containers (no more emojis)
- **Trust Badges**: GDPR, CCPA, App Store, Play Store, SSL compliance badges
- **Platform Logos**: "Trusted by developers building for" — Apple, Google Play, Shopify, WordPress, React, Flutter, Next.js
- **Demo Preview**: Document preview with typing animation
- **"Everything You Need to Launch"**: Progress tracker/checklist showing user is one step away
- **Bottom CTA**: "One step away from launch" final call-to-action before footer

### 5. SEO Improvements
- Better meta title: "PrivacyPage — Privacy Policy Generator for Apps | Free, No Signup"
- Keyword-rich meta description
- JSON-LD structured data: Organization, SoftwareApplication, FAQPage schemas
- `src/app/opengraph-image.tsx` — Auto-generated OG image for homepage
- `src/app/blog/[slug]/opengraph-image.tsx` — Per-post OG images

### 6. Blog (12 posts total)
All posts in `src/lib/blog.ts` as HTML content strings in a `blogPosts` array.

**Original 6:**
- free-privacy-policy-generator-ios-apps
- gdpr-privacy-policy-template-2026
- how-to-add-privacy-policy-app-store
- free-privacy-policy-generator
- free-terms-of-service-generator
- cookie-policy-guide

**New 6 (SEO-targeted):**
- privacy-policy-generator-shopify
- termly-alternative-free
- privacy-policy-app-india
- app-store-rejection-privacy-policy
- privacy-policy-for-react-native-app
- gdpr-vs-ccpa-difference-developers

Blog pages now have:
- CTA banner at top of each post
- Category tags derived from keywords
- OG images per post

### 7. CSS Animations (in `globals.css`)
- `animate-float` — gentle up-down for hero illustration
- `animate-pulse-slow` — slow pulse for progress tracker current step
- `animate-typing` — sequential line fade-in for demo preview
- Scroll fade-in via `FadeInView` component

---

## Known Issues to Fix
1. **FadeInView sections may flash** — Content is SSR-visible, then briefly goes opacity-0 on hydration before observer fires. Could use `@starting-style` or remove animation from above-the-fold sections.
2. **Some sections may have too much vertical spacing** — Review padding between sections
3. **Mobile responsiveness** — Hero two-column should stack properly on mobile (verify)
4. **Blog post content is HTML strings** — Works but hard to maintain. Consider MDX migration later.
5. **OG images** — Verify they render correctly on Vercel (edge runtime)

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/          # Document generation endpoints
│   │   │   ├── route.ts       # Privacy policy
│   │   │   ├── tos/route.ts   # Terms of service
│   │   │   ├── cookie/route.ts
│   │   │   ├── disclaimer/route.ts
│   │   │   └── eula/route.ts
│   │   ├── license/verify/route.ts  # License key verification
│   │   └── payment/
│   │       ├── create-order/route.ts  # Razorpay order creation
│   │       └── verify/route.ts        # Payment verification
│   ├── blog/
│   │   ├── page.tsx           # Blog listing
│   │   └── [slug]/
│   │       ├── page.tsx       # Blog post
│   │       └── opengraph-image.tsx  # Per-post OG image
│   ├── globals.css            # Theme, animations, custom classes
│   ├── icon.svg               # Favicon
│   ├── layout.tsx             # Root layout + JSON-LD schemas
│   ├── opengraph-image.tsx    # Homepage OG image
│   ├── page.tsx               # Homepage (main file)
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── FadeInView.tsx         # Scroll animation wrapper
│   ├── Icons.tsx              # SVG icon components
│   ├── Illustrations.tsx      # SVG illustration components
│   ├── Logo.tsx               # Brand logo component
│   ├── PolicyPreview.tsx      # Document preview/copy UI
│   └── Wizard.tsx             # Multi-step form wizard
├── hooks/
│   └── useRazorpay.ts        # Razorpay payment hook
└── lib/
    ├── blog.ts                # Blog posts data (HTML content)
    ├── currency.ts            # Geo-based pricing (INR/USD)
    └── wizardConfigs.ts       # Wizard form configurations
```

---

## How the Payment Flow Works
1. User fills wizard → sees blurred preview
2. Clicks "Buy" → `useRazorpay` hook calls `/api/payment/create-order` (creates Razorpay order)
3. Razorpay checkout opens → user pays
4. On success → `/api/payment/verify` verifies signature
5. License key stored in localStorage → document unblurred
6. "Restore Purchase" flow: email/key → `/api/license/verify` → restores access

**DO NOT modify the API routes or payment flow without testing thoroughly.**

---

## Environment Variables Needed
```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

These are set in `.env.local` (not committed).

---

## Deployment
Hosted on Vercel. Connected to Git repo.

**To deploy:**
```bash
git add -A
git commit -m "feat: redesign + SEO blog posts + visual polish"
git push origin main
```

Vercel auto-deploys from `main` branch.

**To test locally:**
```bash
npm run dev    # localhost:3000
npm run build  # verify no errors
```

---

## Design System Quick Reference
- **Primary:** indigo-600 (#4F46E5)
- **Primary light:** indigo-50 (#EEF2FF)
- **Background:** white / gray-50
- **Text:** gray-900 (headings), gray-600 (body)
- **Borders:** gray-200
- **Success:** green-500
- **Cards:** white bg, gray-200 border, rounded-2xl, soft shadow on hover
- **Buttons:** indigo-600 bg, white text, rounded-xl, hover scale-105
- **Typography:** System fonts (no custom fonts loaded)
- **Tailwind:** v4 (CSS-based config in globals.css, no tailwind.config file)

---

## Content Rules
- No fake testimonials or inflated stats
- Indie dev angle: "Built by Rushiraj" — link to rushiraj.me
- Competitor comparison: "Termly charges $10/month, we charge $9.99 once"
- Pricing: Free preview → $9.99 single doc → $24.99 bundle (geo-priced: ₹849 / ₹2099 in India)
- Blog posts: genuinely useful SEO content with natural CTAs
