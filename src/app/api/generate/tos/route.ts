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

  let docText = await generateDocumentContent("tos", data);
  if (!docText) {
    docText = generateTosTemplate(data);
  }

  return respondWithGeneratedDocument("tos", data, docText);
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
