// Shared LLM document generation: prompt construction per doc type plus the
// OpenRouter -> Anthropic fallback chain. Used by the /api/generate* routes
// (which add their own template fallbacks) and by document regeneration.

const SYSTEM_PROMPTS: Record<string, string> = {
  privacy:
    "You are a legal document generator specializing in privacy policies for mobile and web applications. Generate professional, comprehensive, and legally-compliant privacy policies.",
  tos: "You are a legal document generator specializing in Terms of Service agreements for digital products and services.",
  eula: "You are a legal document generator specializing in End-User License Agreements for software applications.",
  cookie: "You are a legal document generator specializing in Cookie Policies for websites and web applications.",
  disclaimer: "You are a legal document generator specializing in Disclaimers for websites, apps, and digital content.",
};

export function buildDocPrompt(docType: string, data: Record<string, string>): string {
  const today = new Date().toISOString().split("T")[0];

  switch (docType) {
    case "tos":
      return `Generate a professional, legally-compliant Terms of Service (ToS) agreement. Output ONLY the Terms of Service text in Markdown format.

Service Details:
- Service Name: ${data.serviceName || "Service"}
- Company Info: ${data.companyInfo || "Company"}
- Platform: ${data.platform || "Web App"}
- Key Policies: ${data.keyPolicies || "Standard policies"}
- Jurisdiction: ${data.jurisdiction || "USA"}

Requirements:
1. Start with "# Terms of Service for [Service Name]"
2. Include effective date (today: ${today})
3. Include these sections:
   - Acceptance of Terms
   - Description of Service
   - User Accounts and Registration
   - User Responsibilities and Conduct
   - Intellectual Property Rights
   - Payment Terms (if applicable based on key policies)
   - Refund Policy (based on key policies)
   - Content and User-Generated Content (if applicable)
   - Account Termination and Suspension
   - Disclaimers and Limitations of Liability
   - Indemnification
   - Governing Law and Dispute Resolution
   - Changes to Terms
   - Contact Information
4. Be specific about the policies mentioned in key policies
5. Use clear, legally sound language
6. Be comprehensive (at least 60 lines)`;

    case "eula":
      return `Generate a professional, legally-compliant End-User License Agreement (EULA). Output ONLY the EULA text in Markdown format.

App Details:
- App/Company: ${data.appName || "App"}
- Platform: ${data.platform || "All Platforms"}
- License Type: ${data.licenseType || "Paid"}
- Restrictions: ${data.restrictions || "Standard restrictions"}

Requirements:
1. Start with "# End-User License Agreement (EULA) for [App Name]"
2. Include effective date (today: ${today})
3. Include these sections:
   - Grant of License
   - License Restrictions
   - Intellectual Property Rights
   - User Responsibilities
   - Installation and Use
   - Updates and Maintenance
   - Termination
   - Warranty Disclaimers
   - Limitation of Liability
   - Governing Law
   - Entire Agreement
   - Contact Information
4. Be specific about license type (${data.licenseType}) and restrictions
5. Use clear, legally binding language
6. Be comprehensive (at least 50 lines)`;

    case "cookie":
      return `Generate a professional, legally-compliant Cookie Policy. Output ONLY the Cookie Policy text in Markdown format.

Website Details:
- Website Name & URL: ${data.websiteName || "Website"}
- Cookie Types: ${data.cookieTypes || "Essential cookies"}
- Third-Party Services: ${data.thirdPartyServices || "None"}
- Contact Email: ${data.contactEmail || "contact@website.com"}

Requirements:
1. Start with "# Cookie Policy for [Website Name]"
2. Include effective date (today: ${today})
3. Include these sections:
   - What Are Cookies
   - How We Use Cookies
   - Types of Cookies We Use (specific to the cookie types mentioned)
   - Third-Party Cookies (specific to services mentioned)
   - Managing Your Cookie Preferences
   - Browser Controls
   - Updates to This Policy
   - Contact Us
4. Be specific about the cookie types and third-party services
5. Include EU Cookie Law (GDPR) compliance information
6. Explain how to opt-out and manage cookies
7. Be comprehensive but readable (at least 40 lines)`;

    case "disclaimer":
      return `Generate a professional, legally-sound Disclaimer. Output ONLY the Disclaimer text in Markdown format.

Website/App Details:
- Name & Company: ${data.websiteName || "Website"}
- Disclaimer Type: ${data.disclaimerType || "General"}
- External Links: ${data.externalLinks || "No"}
- Contact Email: ${data.contactEmail || "contact@website.com"}

Requirements:
1. Start with "# Disclaimer for [Website/App Name]"
2. Include effective date (today: ${today})
3. Include these sections based on disclaimer type:
   - General Information
   - No Warranties (applicable to all)
   - Limitation of Liability
   - Type-specific disclaimers (medical, financial, legal, etc.)
   - External Links Disclaimer (if applicable)
   - Fair Use Notice (if relevant)
   - Errors and Omissions
   - Contact Information
4. Be specific to the disclaimer type: ${data.disclaimerType}
5. Use legally protective language
6. Be comprehensive (at least 40 lines)`;

    default:
      // privacy
      return `Generate a professional, legally-compliant privacy policy for the following app. Output ONLY the privacy policy text in Markdown format. Make it thorough, professional, and specific to this app's data practices.

App Details:
- App Name: ${data.appName || "App"}
- Platform: ${data.platform || "Mobile"}
- Company/Developer: ${data.companyName || "Developer"}
- Website: ${data.websiteUrl || "N/A"}
- Contact Email: ${data.contactEmail || "N/A"}
- Data Collected: ${data.dataCollected || "General usage data"}
- Third-Party Services: ${data.thirdParties || "None"}
- Children Under 13: ${data.childrenData || "No"}

Requirements:
1. Start with "# Privacy Policy for [App Name]"
2. Include effective date (today: ${today})
3. Include these sections:
   - Information We Collect
   - How We Use Your Information
   - Data Sharing and Third Parties
   - Data Security
   - Your Rights (GDPR section for EU users)
   - California Privacy Rights (CCPA)
   - Children's Privacy (COPPA if applicable)
   - Data Retention
   - Changes to This Policy
   - Contact Us
4. Be specific about the data types and third-party services mentioned
5. Use clear, readable language
6. Make it App Store / Play Store compliant
7. Include specific rights under GDPR (access, rectification, erasure, portability, restriction, objection)
8. Be at least 50 lines long for completeness`;
  }
}

/**
 * Run the LLM chain (OpenRouter Kimi first, Anthropic fallback) for a doc
 * type and its wizard inputs. Returns "" when neither provider produced
 * content - callers decide the fallback (template or error).
 */
export async function generateDocumentContent(
  docType: string,
  data: Record<string, string>
): Promise<string> {
  const prompt = buildDocPrompt(docType, data);
  const systemPrompt = SYSTEM_PROMPTS[docType] || SYSTEM_PROMPTS.privacy;

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  let docText = "";

  if (openrouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openrouterKey}`,
        },
        body: JSON.stringify({
          model: "moonshotai/kimi-k2.5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });
      const json = await res.json();
      docText = json.choices?.[0]?.message?.content || "";
    } catch (e) {
      console.error("OpenRouter error:", e);
    }
  }

  if (!docText && anthropicKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const json = await res.json();
      docText = json.content?.[0]?.text || "";
    } catch (e) {
      console.error("Anthropic error:", e);
    }
  }

  return docText;
}
