import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const prompt = `Generate a professional, legally-compliant privacy policy for the following app. Output ONLY the privacy policy text in Markdown format. Make it thorough, professional, and specific to this app's data practices.

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
2. Include effective date (today: ${new Date().toISOString().split("T")[0]})
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

  // Try OpenRouter (Kimi) first, fall back to Anthropic
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  let policyText = "";

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
                "You are a legal document generator specializing in privacy policies for mobile and web applications. Generate professional, comprehensive, and legally-compliant privacy policies.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });
      const json = await res.json();
      policyText = json.choices?.[0]?.message?.content || "";
    } catch (e) {
      console.error("OpenRouter error:", e);
    }
  }

  // Fallback to Anthropic
  if (!policyText && anthropicKey) {
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
      policyText = json.content?.[0]?.text || "";
    } catch (e) {
      console.error("Anthropic error:", e);
    }
  }

  // Ultimate fallback: template-based
  if (!policyText) {
    policyText = generateTemplate(data);
  }

  return NextResponse.json({ policy: policyText });
}

function generateTemplate(data: Record<string, string>): string {
  const date = new Date().toISOString().split("T")[0];
  return `# Privacy Policy for ${data.appName || "App"}

**Effective Date:** ${date}

${data.companyName || "The developer"} ("we," "us," or "our") operates ${data.appName || "the app"} (the "App"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our App.

## Information We Collect

We collect the following types of information:
${(data.dataCollected || "General usage data").split(", ").map((d: string) => `- ${d}`).join("\n")}

## How We Use Your Information

We use collected data to:
- Provide and maintain our App
- Improve user experience
- Send important notices and updates
- Analyze usage patterns

## Third-Party Services

Our App uses the following third-party services:
${(data.thirdParties || "None").split(", ").map((t: string) => `- ${t}`).join("\n")}

Each third-party service has its own Privacy Policy. We encourage you to review them.

## Data Security

We value your trust and strive to use commercially acceptable means of protecting your personal data. However, no method of electronic transmission or storage is 100% secure.

## Your Rights (GDPR)

If you are in the European Economic Area, you have rights including:
- Right to access your personal data
- Right to rectification
- Right to erasure
- Right to data portability
- Right to restrict processing
- Right to object to processing

## California Privacy Rights (CCPA)

California residents have the right to:
- Know what personal data is collected
- Request deletion of personal data
- Opt out of data sales (we do not sell data)

## Children's Privacy

${data.childrenData === "Yes" ? "Our App is directed at children under 13. We comply with COPPA requirements." : "Our App is not directed at children under 13. We do not knowingly collect data from children."}

## Contact Us

For privacy inquiries, contact us at: ${data.contactEmail || "N/A"}
${data.websiteUrl ? `Website: ${data.websiteUrl}` : ""}

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of changes by posting the new policy on this page.`;
}
