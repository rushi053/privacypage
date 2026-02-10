import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrivacyPage — AI Privacy Policy Generator for Apps",
  description:
    "Generate professional, legally-compliant privacy policies for your iOS, Android, or web app in under 60 seconds. GDPR, CCPA, and App Store ready.",
  keywords: [
    "privacy policy generator",
    "app privacy policy",
    "ios privacy policy",
    "android privacy policy",
    "gdpr privacy policy",
    "ccpa compliance",
    "terms of service generator",
    "app store privacy policy",
  ],
  openGraph: {
    title: "PrivacyPage — AI Privacy Policy Generator for Apps",
    description:
      "Generate professional privacy policies for your app in 60 seconds. GDPR & CCPA ready.",
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
