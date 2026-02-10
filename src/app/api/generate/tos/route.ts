import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const prompt = `Generate a professional, legally-compliant Terms of Service (ToS) agreement. Output ONLY the Terms of Service text in Markdown format.

Service Details:
- Service Name: ${data.serviceName || "Service"}
- Company Info: ${data.companyInfo || "Company"}
- Platform: ${data.platform || "Web App"}
- Key Policies: ${data.keyPolicies || "Standard policies"}
- Jurisdiction: ${data.jurisdiction || "USA"}

Requirements:
1. Start with "# Terms of Service for [Service Name]"
2. Include effective date (today: ${new Date().toISOString().split("T")[0]})
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
                "You are a legal document generator specializing in Terms of Service agreements for digital products and services.",
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
    docText = generateTosTemplate(data);
  }

  return NextResponse.json({ policy: docText });
}

function generateTosTemplate(data: Record<string, string>): string {
  const date = new Date().toISOString().split("T")[0];
  const [company] = (data.companyInfo || "Company").split(",");
  
  return `# Terms of Service for ${data.serviceName || "Service"}

**Effective Date:** ${date}

These Terms of Service ("Terms") govern your use of ${data.serviceName || "the service"} (the "Service") operated by ${company.trim()} ("we," "us," or "our").

## 1. Acceptance of Terms

By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.

## 2. Description of Service

${data.serviceName || "The Service"} is a ${data.platform || "digital service"} that provides [description of core functionality]. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.

## 3. User Accounts and Registration

You may need to create an account to access certain features. You are responsible for:
- Maintaining the confidentiality of your account credentials
- All activities that occur under your account
- Providing accurate and up-to-date information

## 4. User Responsibilities and Conduct

You agree NOT to:
- Violate any laws or regulations
- Infringe on intellectual property rights
- Upload malicious code or viruses
- Harass, abuse, or harm other users
- Attempt to gain unauthorized access to the Service
- Use the Service for any illegal or unauthorized purpose

${data.keyPolicies?.includes("User-generated content") ? `
## 5. User-Generated Content

You retain ownership of content you submit. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with the Service.

You are solely responsible for your content and must not post content that:
- Is illegal, defamatory, or offensive
- Infringes on intellectual property rights
- Contains viruses or malicious code
- Violates these Terms

We reserve the right to remove any content that violates these Terms.` : ''}

## 6. Intellectual Property Rights

All content, features, and functionality of the Service are owned by ${company.trim()} and are protected by copyright, trademark, and other intellectual property laws.

You may not:
- Copy, modify, or distribute our content without permission
- Use our trademarks or branding without authorization
- Reverse engineer or decompile the Service

${data.keyPolicies?.includes("Refunds allowed") || data.keyPolicies?.includes("Subscription auto-renewal") ? `
## 7. Payment Terms

${data.keyPolicies?.includes("Subscription auto-renewal") ? `Subscriptions automatically renew unless cancelled before the renewal date. You will be charged at the beginning of each billing period.` : ''}

${data.keyPolicies?.includes("Refunds allowed") ? `
### Refund Policy
We offer refunds within 30 days of purchase under certain conditions. Contact us at ${data.companyInfo?.split(',')[1]?.trim() || 'support@service.com'} to request a refund.` : ''}

${data.keyPolicies?.includes("No refunds") ? `All sales are final. We do not offer refunds except where required by law.` : ''}

${data.keyPolicies?.includes("Free trial terms") ? `Free trials are available for new users only. Your payment method will be charged when the trial ends unless you cancel.` : ''}` : ''}

## 8. Account Termination and Suspension

${data.keyPolicies?.includes("Account termination rights") ? `
We reserve the right to suspend or terminate your account if you:
- Violate these Terms
- Engage in fraudulent activity
- Cause harm to other users or the Service

You may terminate your account at any time by contacting us.` : `
Either party may terminate this agreement at any time. We may suspend or terminate accounts that violate these Terms.`}

## 9. Disclaimers and Limitations of Liability

THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.

## 10. Indemnification

You agree to indemnify and hold harmless ${company.trim()} from any claims, damages, losses, or expenses arising from:
- Your use of the Service
- Your violation of these Terms
- Your violation of any rights of another party

## 11. Governing Law and Dispute Resolution

These Terms are governed by the laws of ${data.jurisdiction || "the United States"}.

Any disputes will be resolved through binding arbitration in ${data.jurisdiction || "the applicable jurisdiction"}, except where prohibited by law.

## 12. Changes to Terms

We reserve the right to modify these Terms at any time. We will notify users of material changes by email or through the Service. Continued use after changes constitutes acceptance of the new Terms.

## 13. Contact Information

For questions about these Terms, contact us at:
${data.companyInfo || "Company, contact@company.com"}

---

Last Updated: ${date}`;
}
