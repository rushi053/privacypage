export interface WizardStep {
  id: string;
  label: string;
  /** Short step name for the progress rail. */
  name?: string;
  /** One-line, factual "why we ask" hint. */
  why?: string;
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
        name: "Name",
        why: "The policy names the app it covers, so readers and reviewers know which product it applies to.",
        label: "What's your app/website name?",
        placeholder: "e.g. MyApp",
        type: "text",
      },
      {
        id: "platform",
        name: "Platform",
        why: "Mobile and web apps disclose different things, such as device identifiers or browser cookies.",
        label: "What platform is it on?",
        placeholder: "",
        type: "select",
        options: ["iOS", "Android", "Both (iOS & Android)", "Web App", "All Platforms"],
      },
      {
        id: "companyInfo",
        name: "Contact",
        why: "Privacy laws such as GDPR require the policy to say who is responsible for the data and how to reach them.",
        label: "Company name & contact email",
        placeholder: "e.g. Acme Inc., privacy@acme.com",
        type: "text",
      },
      {
        id: "dataCollected",
        name: "Data",
        why: "Each data type you pick becomes a disclosure; the policy should list everything the app collects.",
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
        name: "Services",
        why: "SDKs and services collect data too, and stores expect your policy to mention them.",
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
        name: "Children",
        why: "Apps aimed at children under 13 have extra rules in the US (COPPA), so the policy changes.",
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
        name: "Name",
        why: "The terms name the service they govern.",
        label: "What's your app/service name?",
        placeholder: "e.g. MyApp",
        type: "text",
      },
      {
        id: "companyInfo",
        name: "Contact",
        why: "Users need to know who they are agreeing with and how to contact you.",
        label: "Company name & contact email",
        placeholder: "e.g. Acme Inc., legal@acme.com",
        type: "text",
      },
      {
        id: "platform",
        name: "Platform",
        why: "Wording differs for web services and apps distributed through app stores.",
        label: "What platform?",
        placeholder: "",
        type: "select",
        options: ["Web App", "Mobile App (iOS/Android)", "Both", "SaaS Platform"],
      },
      {
        id: "keyPolicies",
        name: "Policies",
        why: "Each option you pick adds a section, such as refunds, accounts or acceptable use.",
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
        name: "Governing law",
        why: "Terms usually state which country's or state's law applies to disputes.",
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
        name: "Name",
        why: "The licence names the software and the company granting it.",
        label: "App name & company name",
        placeholder: "e.g. MyApp by Acme Inc.",
        type: "text",
      },
      {
        id: "platform",
        name: "Platform",
        why: "Licence terms reference where the software is installed and distributed.",
        label: "What platform?",
        placeholder: "",
        type: "select",
        options: ["iOS", "Android", "Desktop (Windows/Mac)", "Web", "All Platforms"],
      },
      {
        id: "licenseType",
        name: "Licence",
        why: "The licence type sets what the user is allowed to do with the software.",
        label: "License type",
        placeholder: "",
        type: "select",
        options: ["Free", "Paid (one-time)", "Freemium", "Subscription"],
      },
      {
        id: "restrictions",
        name: "Restrictions",
        why: "Each restriction you pick is written into the licence as a clause.",
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
        name: "Name",
        why: "The cookie policy names the site or app and links to it.",
        label: "Website/app name & URL",
        placeholder: "e.g. MyApp, https://myapp.com",
        type: "text",
      },
      {
        id: "cookieTypes",
        name: "Cookies",
        why: "The policy should list each category of cookie the site sets.",
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
        name: "Services",
        why: "Analytics and ad tools set their own cookies, which the policy should name.",
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
        name: "Contact",
        why: "Visitors need a way to ask questions about cookies and their data.",
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
        name: "Name",
        why: "The disclaimer names the site or app and who publishes it.",
        label: "Website/app name & company name",
        placeholder: "e.g. MyApp by Acme Inc.",
        type: "text",
      },
      {
        id: "disclaimerType",
        name: "Type",
        why: "Medical, financial and general disclaimers say different things.",
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
        name: "Links",
        why: "If you link to other sites, the disclaimer says you are not responsible for their content.",
        label: "Do you link to external sites?",
        placeholder: "",
        type: "select",
        options: ["Yes", "No"],
      },
      {
        id: "contactEmail",
        name: "Contact",
        why: "Readers need a way to reach you about the content.",
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
