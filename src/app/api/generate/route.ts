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

  // OpenRouter (Kimi) first, Anthropic fallback; template as ultimate fallback.
  let policyText = await generateDocumentContent("privacy", data);
  if (!policyText) {
    policyText = generateTemplate(data);
  }

  return respondWithGeneratedDocument("privacy", data, policyText);
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
