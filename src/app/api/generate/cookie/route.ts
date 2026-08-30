import { NextRequest, NextResponse } from "next/server";
import { respondWithGeneratedDocument } from "@/lib/generate-response";
import { generateDocumentContent } from "@/lib/generate-content";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!(await checkRateLimit(getClientIp(req)))) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many documents generated. Please try again in an hour." },
      { status: 429 }
    );
  }

  const data = await req.json();

  let docText = await generateDocumentContent("cookie", data);
  if (!docText) {
    docText = generateCookieTemplate(data);
  }

  return respondWithGeneratedDocument("cookie", data, docText);
}

function generateCookieTemplate(data: Record<string, string>): string {
  const date = new Date().toISOString().split("T")[0];
  const [websiteName, url] = (data.websiteName || "Our Website").split(", ");
  const cookieTypes = (data.cookieTypes || "").split(", ");
  const thirdParty = (data.thirdPartyServices || "").split(", ");

  return `# Cookie Policy for ${websiteName}

**Effective Date:** ${date}

This Cookie Policy explains how ${websiteName} ${url ? `(${url})` : ""} uses cookies and similar tracking technologies.

## What Are Cookies?

Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, analyze traffic, and improve functionality.

Cookies can be:
- **First-party cookies:** Set by our website
- **Third-party cookies:** Set by external services we use
- **Session cookies:** Deleted when you close your browser
- **Persistent cookies:** Remain on your device for a set period

## How We Use Cookies

We use cookies to:
- Ensure the website functions properly
- Remember your preferences and settings
- Analyze how visitors use our site
- Improve our services and user experience
${cookieTypes.includes("Advertising cookies") ? "- Deliver relevant advertisements" : ""}
${cookieTypes.includes("Social media cookies") ? "- Enable social media features and sharing" : ""}

## Types of Cookies We Use

${cookieTypes.includes("Essential cookies") ? `
### 1. Essential Cookies (Strictly Necessary)

These cookies are required for the website to function and cannot be disabled.

**Purpose:**
- Enable core functionality (login, security, session management)
- Remember items in your shopping cart
- Maintain security and prevent fraud

**Legal Basis:** Legitimate interest (necessary for the service)` : ""}

${cookieTypes.includes("Analytics cookies") ? `
### 2. Analytics and Performance Cookies

These cookies help us understand how visitors interact with our website.

**Purpose:**
- Track page views and traffic sources
- Measure website performance
- Identify popular content
- Understand user behavior patterns

**Examples:** Google Analytics, Mixpanel, Amplitude

**Legal Basis:** Consent (you can opt-out)` : ""}

${cookieTypes.includes("Functional cookies") ? `
### 3. Functional Cookies

These cookies enable enhanced functionality and personalization.

**Purpose:**
- Remember your preferences (language, region)
- Enable live chat and support features
- Customize content based on your interests

**Legal Basis:** Consent (you can opt-out)` : ""}

${cookieTypes.includes("Advertising cookies") ? `
### 4. Advertising and Targeting Cookies

These cookies are used to deliver relevant ads and measure campaign effectiveness.

**Purpose:**
- Show personalized advertisements
- Limit ad frequency
- Measure ad performance
- Track conversions

**Examples:** Google Ads, Facebook Pixel

**Legal Basis:** Consent (required under GDPR)` : ""}

${cookieTypes.includes("Performance cookies") ? `
### 5. Performance Cookies

These cookies collect information about how you use our website to improve performance.

**Purpose:**
- Monitor loading times
- Track errors and crashes
- Optimize user experience
- Test new features

**Legal Basis:** Consent (you can opt-out)` : ""}

${cookieTypes.includes("Social media cookies") ? `
### 6. Social Media Cookies

These cookies enable social media features and track social sharing.

**Purpose:**
- Share content on social platforms
- Display social media feeds
- Track social engagement

**Examples:** Facebook, Twitter/X, LinkedIn

**Legal Basis:** Consent (required for tracking)` : ""}

## Third-Party Cookies

We use the following third-party services that may set cookies:

${thirdParty.filter(s => s !== "None").map(service => {
  const descriptions: Record<string, string> = {
    "Google Analytics": "**Google Analytics:** Web analytics service that tracks and reports website traffic. [Opt-out](https://tools.google.com/dlpage/gaoptout)",
    "Google Ads": "**Google Ads:** Advertising platform for displaying targeted ads. [Ad Settings](https://adssettings.google.com/)",
    "Facebook Pixel": "**Facebook Pixel:** Tracking tool for measuring ad effectiveness and audience targeting. [Privacy Settings](https://www.facebook.com/privacy/explanation)",
    "Twitter/X tracking": "**Twitter/X:** Social media tracking for engagement and advertising. [Privacy Center](https://twitter.com/en/privacy)",
    "LinkedIn Insight": "**LinkedIn Insight Tag:** Professional network analytics and advertising. [Ad Settings](https://www.linkedin.com/psettings/advertising)",
    "Hotjar": "**Hotjar:** Behavior analytics and user feedback tool. [Opt-out](https://www.hotjar.com/policies/do-not-track/)",
    "Stripe": "**Stripe:** Payment processing service (essential for transactions). [Privacy Policy](https://stripe.com/privacy)",
  };
  return descriptions[service] || `**${service}:** Third-party service used on our website.`;
}).join("\n")}

Each third-party service has its own privacy policy and cookie practices. We encourage you to review them.

## Managing Your Cookie Preferences

You have the right to accept or reject cookies (except essential cookies required for the website to function).

### Cookie Consent Banner

When you first visit our website, you'll see a cookie consent banner. You can:
- Accept all cookies
- Reject non-essential cookies
- Customize your preferences

You can change your preferences at any time by clicking the "Cookie Settings" link in our footer.

### Browser Controls

You can also manage cookies through your browser settings:

**Chrome:** Settings > Privacy and Security > Cookies and other site data
**Firefox:** Settings > Privacy & Security > Cookies and Site Data
**Safari:** Preferences > Privacy > Manage Website Data
**Edge:** Settings > Cookies and site permissions

**Note:** Blocking all cookies may affect website functionality and your user experience.

### Opt-Out Links

For specific services:
- **Google Analytics:** [Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout)
- **Google Ads:** [Ad Settings](https://adssettings.google.com/)
- **Facebook:** [Ad Preferences](https://www.facebook.com/ads/preferences/)
- **Network Advertising Initiative:** [Opt-out Tool](https://optout.networkadvertising.org/)
- **Digital Advertising Alliance:** [WebChoices Tool](https://optout.aboutads.info/)

## Your Rights (GDPR)

If you are in the European Union, you have additional rights:
- Right to access information about cookies we use
- Right to withdraw consent at any time
- Right to object to processing for direct marketing
- Right to lodge a complaint with your data protection authority

## Do Not Track Signals

Some browsers have "Do Not Track" features. Currently, there is no industry standard for responding to DNT signals. We may not respond to DNT headers, but you can manage cookies as described above.

## Mobile Devices

Our website may use mobile device identifiers for analytics and advertising. You can reset your advertising ID or limit ad tracking in your device settings:
- **iOS:** Settings > Privacy > Advertising > Limit Ad Tracking
- **Android:** Settings > Google > Ads > Opt out of Ads Personalization

## Updates to This Policy

We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices.

Last updated: ${date}

We will notify you of significant changes by posting a notice on our website or by email.

## Contact Us

If you have questions about our use of cookies, contact us at:

**Email:** ${data.contactEmail || "privacy@website.com"}
${url ? `**Website:** ${url}` : ""}

---

**Cookie Table Summary**

| Cookie Type | Purpose | Duration | Third Party |
|------------|---------|----------|------------|
${cookieTypes.includes("Essential cookies") ? "| Essential | Website functionality | Session/Persistent | No |" : ""}
${cookieTypes.includes("Analytics cookies") ? "| Analytics | Usage tracking | Persistent | Yes |" : ""}
${cookieTypes.includes("Advertising cookies") ? "| Advertising | Targeted ads | Persistent | Yes |" : ""}
${cookieTypes.includes("Functional cookies") ? "| Functional | Personalization | Persistent | Sometimes |" : ""}
${cookieTypes.includes("Social media cookies") ? "| Social Media | Social features | Persistent | Yes |" : ""}

For a detailed list of specific cookies, please see our [cookie declaration].`;
}
