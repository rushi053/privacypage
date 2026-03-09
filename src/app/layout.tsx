import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrivacyPage — Privacy Policy Generator for Apps | Free, No Signup",
  description:
    "Generate privacy policies, terms of service, and legal docs for your app in 60 seconds. Free preview, no signup. GDPR, CCPA & App Store compliant. One-time payment, not subscription.",
  keywords: [
    "privacy policy generator",
    "free privacy policy generator",
    "privacy policy generator no signup",
    "terms of service generator",
    "eula generator",
    "cookie policy generator",
    "disclaimer generator",
    "legal documents for apps",
    "app privacy policy",
    "ios privacy policy generator",
    "android privacy policy",
    "gdpr compliance tool",
    "ccpa compliance",
    "app store privacy policy",
    "play store legal requirements",
    "termly alternative",
    "iubenda alternative",
    "freeprivacypolicy alternative",
  ],
  icons: { icon: "/icon.svg" },
  metadataBase: new URL("https://privacypage.io"),
  alternates: { canonical: "https://privacypage.io" },
    openGraph: {
    title: "PrivacyPage — Privacy Policy Generator for Apps (Free, No Signup)",
    description:
      "Generate privacy policies and legal docs for your app in 60 seconds. Free preview. One-time payment, not subscription. GDPR & CCPA compliant.",
    url: "https://privacypage.io",
    siteName: "PrivacyPage",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrivacyPage — Privacy Policy Generator (Free, No Signup)",
    description:
      "Generate privacy policies, ToS, EULA, and more in 60 seconds. One-time payment, not subscription.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Organization Schema */}
        <Script id="schema-organization" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "PrivacyPage",
            "url": "https://privacypage.io",
            "logo": "https://privacypage.io/icon.svg",
            "description": "Generate privacy policies and legal documents for apps. Free preview, one-time payment.",
            "founder": {
              "@type": "Person",
              "name": "Rushiraj Jadeja",
              "url": "https://rushiraj.me"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "rushirajjadeja@gmail.com",
              "contactType": "customer support"
            }
          })}
        </Script>

        {/* SoftwareApplication Schema */}
        <Script id="schema-software" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PrivacyPage",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "url": "https://privacypage.io",
            "description": "Generate professional privacy policies, terms of service, EULAs, and more in 60 seconds. GDPR & CCPA compliant. Free preview, one-time payment.",
            "offers": [
              {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free preview - see how it works",
                "availability": "https://schema.org/InStock"
              },
              {
                "@type": "Offer",
                "price": "9.99",
                "priceCurrency": "USD",
                "description": "Pro - Single Document (one-time payment)",
                "availability": "https://schema.org/InStock"
              },
              {
                "@type": "Offer",
                "price": "24.99",
                "priceCurrency": "USD",
                "description": "Bundle - All 5 Documents (one-time payment)",
                "availability": "https://schema.org/InStock"
              }
            ],
            "featureList": ["Privacy Policy Generator", "Terms of Service Generator", "EULA Generator", "Cookie Policy Generator", "Disclaimer Generator", "GDPR Compliant", "CCPA Compliant"]
          })}
        </Script>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DLKEQ0N44H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DLKEQ0N44H');
          `}
        </Script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
