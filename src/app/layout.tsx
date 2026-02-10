import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrivacyPage — Legal Document Generator for Apps | Privacy Policy, ToS, EULA & More",
  description:
    "Generate professional legal documents for your app in 60 seconds. Privacy Policy, Terms of Service, EULA, Cookie Policy, and Disclaimer. GDPR, CCPA, and App Store compliant.",
  keywords: [
    "privacy policy generator",
    "terms of service generator",
    "eula generator",
    "cookie policy generator",
    "disclaimer generator",
    "legal documents for apps",
    "app privacy policy",
    "ios privacy policy",
    "android privacy policy",
    "gdpr compliance",
    "ccpa compliance",
    "app store legal docs",
    "play store legal requirements",
    "saas legal documents",
    "mobile app legal docs",
  ],
  openGraph: {
    title: "PrivacyPage — Legal Document Generator for Apps",
    description:
      "Generate privacy policies, terms of service, EULAs, and more in 60 seconds. GDPR & CCPA compliant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
