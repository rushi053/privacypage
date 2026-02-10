import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const prompt = `Generate a professional, legally-compliant End-User License Agreement (EULA). Output ONLY the EULA text in Markdown format.

App Details:
- App/Company: ${data.appName || "App"}
- Platform: ${data.platform || "All Platforms"}
- License Type: ${data.licenseType || "Paid"}
- Restrictions: ${data.restrictions || "Standard restrictions"}

Requirements:
1. Start with "# End-User License Agreement (EULA) for [App Name]"
2. Include effective date (today: ${new Date().toISOString().split("T")[0]})
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
            {
              role: "system",
              content:
                "You are a legal document generator specializing in End-User License Agreements for software applications.",
            },
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

  if (!docText) {
    docText = generateEulaTemplate(data);
  }

  return NextResponse.json({ policy: docText });
}

function generateEulaTemplate(data: Record<string, string>): string {
  const date = new Date().toISOString().split("T")[0];
  const [appName, company] = (data.appName || "App").split(" by ");
  const restrictions = (data.restrictions || "").split(", ");

  return `# End-User License Agreement (EULA) for ${appName || "App"}

**Effective Date:** ${date}

This End-User License Agreement ("Agreement") is between you and ${company || "the developer"} ("Licensor") regarding your use of ${appName || "the application"} (the "Application").

By installing, accessing, or using the Application, you agree to be bound by this Agreement.

## 1. Grant of License

${company || "The Licensor"} grants you a ${data.licenseType === "Free" ? "free, non-exclusive, non-transferable" : data.licenseType === "Subscription" ? "subscription-based, non-exclusive, non-transferable" : "limited, non-exclusive, non-transferable"} license to:
- Install and use the Application on authorized devices
- Access the Application's features and functionality
${data.licenseType === "Subscription" ? "- Continue use for the duration of your active subscription" : data.licenseType === "Free" ? "- Use the Application for personal, non-commercial purposes" : "- Use the Application in accordance with this Agreement"}

${restrictions.includes("Single user license") ? "This license is for a single user only and may not be shared." : ""}

## 2. License Restrictions

You agree NOT to:
${restrictions.includes("No reverse engineering") ? "- Reverse engineer, decompile, or disassemble the Application" : ""}
${restrictions.includes("No redistribution") ? "- Redistribute, sell, rent, lease, or lend the Application" : ""}
${restrictions.includes("No modifications") ? "- Modify, adapt, or create derivative works of the Application" : ""}
${restrictions.includes("No commercial use (free apps)") ? "- Use the Application for commercial purposes" : ""}
${restrictions.includes("No resale") ? "- Resell or transfer your license to another party" : ""}
- Remove or alter any copyright, trademark, or proprietary notices
- Use the Application for any illegal purpose
- Bypass any license validation or copy protection mechanisms
- Share your account credentials with others

## 3. Intellectual Property Rights

The Application and all intellectual property rights therein are owned by ${company || "the Licensor"} and are protected by copyright, trademark, patent, and other intellectual property laws.

This license does not grant you any ownership rights to the Application. All rights not expressly granted are reserved.

## 4. User Responsibilities

You are responsible for:
- Maintaining compatible hardware and operating systems
- Ensuring your use complies with applicable laws
- Maintaining the security of your account and credentials
- Any activities conducted under your account

## 5. Installation and Use

The Application is designed for ${data.platform || "multiple platforms"}. You may install it on devices you own or control in accordance with this license.

${data.licenseType === "Subscription" ? `
### Subscription Terms
Your subscription automatically renews until cancelled. You may cancel at any time. Access continues until the end of your current billing period.` : ""}

${data.licenseType === "Paid (one-time)" ? `
### License Activation
Your license is perpetual but may require activation. Keep your license key secure and do not share it.` : ""}

## 6. Updates and Maintenance

${company || "The Licensor"} may provide updates, patches, or new versions of the Application. Updates may be automatic or require your consent.

We are not obligated to provide support or maintenance, but may do so at our discretion.

## 7. Termination

This Agreement is effective until terminated.

**Termination by You:** You may terminate by uninstalling the Application and destroying all copies.

**Termination by Licensor:** We may terminate your license if you breach this Agreement.

${data.licenseType === "Subscription" ? "Subscriptions terminate automatically if payment fails or you cancel." : ""}

Upon termination:
- You must cease all use of the Application
- Uninstall and delete all copies
- Your license rights immediately cease

## 8. Warranty Disclaimers

THE APPLICATION IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.

${company || "THE LICENSOR"} DISCLAIMS ALL WARRANTIES INCLUDING:
- MERCHANTABILITY
- FITNESS FOR A PARTICULAR PURPOSE
- NON-INFRINGEMENT
- ACCURACY OR RELIABILITY

We do not warrant that:
- The Application will be error-free or uninterrupted
- Defects will be corrected
- The Application is free from viruses or harmful components

## 9. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${(company || "THE LICENSOR").toUpperCase()} SHALL NOT BE LIABLE FOR:
- Any indirect, incidental, special, or consequential damages
- Loss of profits, data, or business opportunities
- Damages arising from your use or inability to use the Application

${data.licenseType === "Paid (one-time)" ? "Our total liability shall not exceed the amount you paid for the Application." : data.licenseType === "Subscription" ? "Our total liability shall not exceed the amount paid in the 12 months prior to the claim." : ""}

Some jurisdictions do not allow limitation of liability for personal injury or certain damages, so this may not apply to you.

## 10. Indemnification

You agree to indemnify and hold harmless ${company || "the Licensor"} from claims, damages, or expenses arising from:
- Your use of the Application
- Your breach of this Agreement
- Your violation of any law or rights of third parties

## 11. Governing Law

This Agreement is governed by the laws of ${data.platform?.includes("iOS") ? "California, USA (App Store compliance)" : data.platform?.includes("Android") ? "the jurisdiction of the developer" : "the applicable jurisdiction"}, without regard to conflict of law principles.

${data.platform?.includes("iOS") ? "\n**iOS App Store Compliance:** This Application is licensed, not sold. Your rights are subject to Apple's standard EULA terms." : ""}
${data.platform?.includes("Android") ? "\n**Google Play Compliance:** Your use is also subject to Google Play's Terms of Service." : ""}

## 12. Entire Agreement

This Agreement constitutes the entire agreement between you and ${company || "the Licensor"} regarding the Application and supersedes all prior agreements.

Changes to this Agreement must be in writing and signed by both parties.

## 13. Export Compliance

You agree to comply with all export and import laws and regulations. You may not export or re-export the Application except as authorized by law.

## 14. Severability

If any provision of this Agreement is found unenforceable, the remaining provisions continue in full force and effect.

## 15. Contact Information

For questions about this EULA, contact:
${data.appName || "Developer"}

---

**Acknowledgment:** By using the Application, you acknowledge that you have read this Agreement, understand it, and agree to be bound by its terms.

Last Updated: ${date}`;
}
