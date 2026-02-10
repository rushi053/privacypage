export interface WizardStep {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "select" | "multiselect";
  options?: string[];
}

export interface WizardConfig {
  type: string;
  displayName: string;
  description: string;
  steps: WizardStep[];
}

export const wizardConfigs: Record<string, WizardConfig> = {
  privacy: {
    type: "privacy",
    displayName: "Privacy Policy",
    description: "GDPR & CCPA compliant privacy policy for your app or website",
    steps: [
      {
        id: "appName",
        label: "What's your app/website name?",
        placeholder: "e.g. MyApp",
        type: "text",
      },
      {
        id: "platform",
        label: "What platform is it on?",
        placeholder: "",
        type: "select",
        options: ["iOS", "Android", "Both (iOS & Android)", "Web App", "All Platforms"],
      },
      {
        id: "companyInfo",
        label: "Company name & contact email",
        placeholder: "e.g. Acme Inc., privacy@acme.com",
        type: "text",
      },
      {
        id: "dataCollected",
        label: "What data do you collect?",
        placeholder: "",
        type: "multiselect",
        options: [
          "Name & Email",
          "Phone Number",
          "Location Data",
          "Photos / Camera",
          "Device Info",
          "Usage Analytics",
          "Payment Info",
          "Health Data",
          "No Personal Data",
        ],
      },
      {
        id: "thirdParties",
        label: "Third-party services used?",
        placeholder: "",
        type: "multiselect",
        options: [
          "Google Analytics / Firebase",
          "Facebook SDK",
          "AdMob / Ads",
          "Stripe / Payments",
          "Sentry / Crashlytics",
          "Mixpanel / Amplitude",
          "Push Notifications",
          "None",
        ],
      },
      {
        id: "childrenData",
        label: "Is it directed at children under 13?",
        placeholder: "",
        type: "select",
        options: ["No", "Yes", "Partially (some content for children)"],
      },
    ],
  },
  tos: {
    type: "tos",
    displayName: "Terms of Service",
    description: "Legal agreement between you and your users",
    steps: [
      {
        id: "serviceName",
        label: "What's your app/service name?",
        placeholder: "e.g. MyApp",
        type: "text",
      },
      {
        id: "companyInfo",
        label: "Company name & contact email",
        placeholder: "e.g. Acme Inc., legal@acme.com",
        type: "text",
      },
      {
        id: "platform",
        label: "What platform?",
        placeholder: "",
        type: "select",
        options: ["Web App", "Mobile App (iOS/Android)", "Both", "SaaS Platform"],
      },
      {
        id: "keyPolicies",
        label: "Key policies for your service",
        placeholder: "",
        type: "multiselect",
        options: [
          "Refunds allowed",
          "No refunds",
          "User-generated content",
          "Account termination rights",
          "Subscription auto-renewal",
          "Free trial terms",
          "Intellectual property protection",
        ],
      },
      {
        id: "jurisdiction",
        label: "Governing law jurisdiction",
        placeholder: "e.g. California, USA or London, UK",
        type: "text",
      },
    ],
  },
  eula: {
    type: "eula",
    displayName: "EULA",
    description: "End-User License Agreement for your software",
    steps: [
      {
        id: "appName",
        label: "App name & company name",
        placeholder: "e.g. MyApp by Acme Inc.",
        type: "text",
      },
      {
        id: "platform",
        label: "What platform?",
        placeholder: "",
        type: "select",
        options: ["iOS", "Android", "Desktop (Windows/Mac)", "Web", "All Platforms"],
      },
      {
        id: "licenseType",
        label: "License type",
        placeholder: "",
        type: "select",
        options: ["Free", "Paid (one-time)", "Freemium", "Subscription"],
      },
      {
        id: "restrictions",
        label: "Usage restrictions",
        placeholder: "",
        type: "multiselect",
        options: [
          "No reverse engineering",
          "No redistribution",
          "No modifications",
          "No commercial use (free apps)",
          "No resale",
          "Single user license",
        ],
      },
    ],
  },
  cookie: {
    type: "cookie",
    displayName: "Cookie Policy",
    description: "Explain what cookies your website uses",
    steps: [
      {
        id: "websiteName",
        label: "Website/app name & URL",
        placeholder: "e.g. MyApp, https://myapp.com",
        type: "text",
      },
      {
        id: "cookieTypes",
        label: "Cookie types used",
        placeholder: "",
        type: "multiselect",
        options: [
          "Essential cookies",
          "Analytics cookies",
          "Advertising cookies",
          "Functional cookies",
          "Performance cookies",
          "Social media cookies",
        ],
      },
      {
        id: "thirdPartyServices",
        label: "Third-party cookie services",
        placeholder: "",
        type: "multiselect",
        options: [
          "Google Analytics",
          "Google Ads",
          "Facebook Pixel",
          "Twitter/X tracking",
          "LinkedIn Insight",
          "Hotjar",
          "Stripe",
          "None",
        ],
      },
      {
        id: "contactEmail",
        label: "Contact email",
        placeholder: "e.g. privacy@myapp.com",
        type: "text",
      },
    ],
  },
  disclaimer: {
    type: "disclaimer",
    displayName: "Disclaimer",
    description: "Limit liability and set expectations for your content",
    steps: [
      {
        id: "websiteName",
        label: "Website/app name & company name",
        placeholder: "e.g. MyApp by Acme Inc.",
        type: "text",
      },
      {
        id: "disclaimerType",
        label: "Disclaimer type",
        placeholder: "",
        type: "select",
        options: [
          "General (informational content)",
          "Medical (health information)",
          "Financial (investment/trading)",
          "Fitness (workout/nutrition)",
          "Legal (legal information)",
          "Affiliate (affiliate links/commissions)",
        ],
      },
      {
        id: "externalLinks",
        label: "Do you link to external sites?",
        placeholder: "",
        type: "select",
        options: ["Yes", "No"],
      },
      {
        id: "contactEmail",
        label: "Contact email",
        placeholder: "e.g. info@myapp.com",
        type: "text",
      },
    ],
  },
};

export function getWizardConfig(type: string): WizardConfig {
  return wizardConfigs[type] || wizardConfigs.privacy;
}
