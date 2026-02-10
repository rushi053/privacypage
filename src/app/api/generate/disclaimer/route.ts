import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const prompt = `Generate a professional, legally-sound Disclaimer. Output ONLY the Disclaimer text in Markdown format.

Website/App Details:
- Name & Company: ${data.websiteName || "Website"}
- Disclaimer Type: ${data.disclaimerType || "General"}
- External Links: ${data.externalLinks || "No"}
- Contact Email: ${data.contactEmail || "contact@website.com"}

Requirements:
1. Start with "# Disclaimer for [Website/App Name]"
2. Include effective date (today: ${new Date().toISOString().split("T")[0]})
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
                "You are a legal document generator specializing in Disclaimers for websites, apps, and digital content.",
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
    docText = generateDisclaimerTemplate(data);
  }

  return NextResponse.json({ policy: docText });
}

function generateDisclaimerTemplate(data: Record<string, string>): string {
  const date = new Date().toISOString().split("T")[0];
  const disclaimerType = data.disclaimerType || "General (informational content)";

  // Type-specific content
  const typeSpecific: Record<string, string> = {
    "General (informational content)": `
## General Information Disclaimer

The information provided on ${data.websiteName || "this website"} is for general informational purposes only. While we strive to keep the information accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website.

All information is provided "as is" without warranty of any kind.`,

    "Medical (health information)": `
## Medical Disclaimer

**IMPORTANT:** The information on ${data.websiteName || "this website"} is NOT intended as medical advice and should NOT replace consultation with qualified healthcare professionals.

**Key Points:**
- This content is for informational and educational purposes only
- It is NOT a substitute for professional medical advice, diagnosis, or treatment
- Always seek the advice of your physician or qualified health provider with any questions about a medical condition
- Never disregard professional medical advice or delay seeking it because of something you read here
- If you think you may have a medical emergency, call your doctor or 911 immediately

**No Doctor-Patient Relationship:** Use of this website does not create a doctor-patient relationship. We are not liable for any diagnosis or treatment based on information provided here.

**Individual Results May Vary:** Health outcomes and results mentioned are not guaranteed and may vary from person to person.`,

    "Financial (investment/trading)": `
## Financial Disclaimer

**INVESTMENT WARNING:** The information on ${data.websiteName || "this website"} is for educational purposes only and should NOT be considered financial, investment, or trading advice.

**Key Points:**
- We are NOT financial advisors, brokers, or investment professionals
- All content is for informational purposes and should not be relied upon for financial decisions
- Past performance is NOT indicative of future results
- Trading and investing carry risk of loss, including total loss of capital
- Cryptocurrency, forex, and stock trading are highly volatile and risky
- Always consult with a licensed financial advisor before making investment decisions
- We are not responsible for any financial losses incurred from using this information

**Regulatory Compliance:** This website does not provide personalized financial advice and is not registered with any financial regulatory authority.

**No Guarantees:** We make no guarantees about profits, returns, or investment success. All investments carry risk.`,

    "Fitness (workout/nutrition)": `
## Fitness & Health Disclaimer

**CONSULT A PHYSICIAN:** Before beginning any fitness, exercise, or nutrition program, consult with your physician, especially if you:
- Have any medical conditions
- Are taking medications
- Are pregnant or nursing
- Have any physical limitations

**Key Points:**
- The fitness and nutrition information on ${data.websiteName || "this website"} is for educational purposes only
- We are not medical professionals, certified trainers, or registered dietitians (unless explicitly stated)
- Exercise and diet changes carry risks, including injury
- Listen to your body and stop immediately if you experience pain, dizziness, or discomfort
- Individual results vary based on genetics, effort, diet, and other factors

**Assumption of Risk:** By using this information, you assume all risks of injury or health complications. We are not liable for any injuries or damages resulting from following our content.

**Results Not Guaranteed:** Testimonials and transformations shown are individual results and do not guarantee similar outcomes for others.`,

    "Legal (legal information)": `
## Legal Disclaimer

**NOT LEGAL ADVICE:** The information on ${data.websiteName || "this website"} is NOT legal advice and should NOT be used as a substitute for consultation with a licensed attorney.

**Key Points:**
- Content is for general informational purposes only
- Laws vary by jurisdiction and change frequently
- We are not a law firm and do not provide attorney-client relationships
- No content should be relied upon for legal decisions
- Always consult a qualified attorney licensed in your jurisdiction for specific legal advice
- We make no representations about the accuracy or currentness of legal information

**No Attorney-Client Relationship:** Use of this website does not create an attorney-client relationship. Any information shared does not constitute legal representation.

**Jurisdictional Limitations:** Laws differ by state, country, and local jurisdiction. Information may not apply to your specific situation.`,

    "Affiliate (affiliate links/commissions)": `
## Affiliate Disclosure

**AFFILIATE RELATIONSHIPS:** ${data.websiteName || "This website"} contains affiliate links. We may earn commissions when you purchase products or services through our links.

**Key Points:**
- We participate in affiliate programs (Amazon Associates, etc.)
- When you click affiliate links and make purchases, we may receive a commission at no extra cost to you
- Affiliate commissions help support this website and our content creation
- We only recommend products/services we genuinely believe in or have experience with
- Our opinions remain honest, unbiased, and independent
- Affiliate relationships do NOT influence our editorial content

**Your Purchase Price:** Using affiliate links does NOT increase the price you pay. Prices are identical whether you use our link or go directly to the seller.

**Transparency:** We believe in full transparency and want you to know about our affiliate relationships. This disclosure complies with FTC guidelines.`,
  };

  return `# Disclaimer for ${data.websiteName || "Our Website"}

**Effective Date:** ${date}

This disclaimer governs your use of ${data.websiteName || "our website"}. By using this website, you accept this disclaimer in full.

${typeSpecific[disclaimerType] || typeSpecific["General (informational content)"]}

## No Warranties

TO THE FULLEST EXTENT PERMITTED BY LAW, ${(data.websiteName || "WE").toUpperCase()} DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
- Warranties of merchantability
- Fitness for a particular purpose
- Non-infringement
- Accuracy, completeness, or currentness of information
- Uninterrupted or error-free operation

We do not warrant that:
- The website will always be available or accessible
- Information is accurate, complete, or up-to-date
- Defects will be corrected
- The website is free from viruses or harmful components

## Limitation of Liability

IN NO EVENT SHALL ${(data.websiteName || "WE").toUpperCase()} BE LIABLE FOR:
- Any direct, indirect, incidental, special, or consequential damages
- Loss of profits, revenue, or data
- Business interruption
- Personal injury or property damage
- Any damages arising from your use of this website or reliance on its content

This limitation applies even if we have been advised of the possibility of such damages.

**Maximum Liability:** Our total liability to you for all claims shall not exceed $100 or the amount you paid us (if any), whichever is greater.

## Use At Your Own Risk

You acknowledge that:
- Your use of this website is at your sole risk
- You are responsible for any consequences of using the information provided
- You assume full responsibility for decisions made based on this content
- We are not responsible for any loss, injury, claim, liability, or damage resulting from use of this website

${data.externalLinks === "Yes" ? `
## External Links Disclaimer

This website may contain links to external websites not operated by us.

**We Are Not Responsible For:**
- Content on external websites
- Privacy practices of third-party sites
- Accuracy or legality of external content
- Any damages from visiting linked websites

External links are provided for convenience only and do not constitute endorsement. We have no control over the nature, content, or availability of external sites.

**Visit At Your Own Risk:** You visit third-party websites at your own risk. Review their terms and privacy policies before use.` : ""}

## Accuracy of Information

While we strive for accuracy, we cannot guarantee that all information is:
- Current and up-to-date
- Complete and comprehensive
- Free from errors or omissions
- Applicable to your specific situation

Information may change without notice. We reserve the right to modify, update, or remove content at any time without prior notice.

## Professional Consultation

The information on this website is NOT a substitute for professional advice. For matters requiring expertise, consult qualified professionals:
${disclaimerType.includes("Medical") ? "- Healthcare providers for medical issues" : ""}
${disclaimerType.includes("Financial") ? "- Financial advisors for investment decisions" : ""}
${disclaimerType.includes("Legal") ? "- Attorneys for legal matters" : ""}
${disclaimerType.includes("Fitness") ? "- Doctors or certified trainers for fitness programs" : ""}
- Relevant experts in your field of concern

## Testimonials and Reviews

${disclaimerType.includes("Affiliate") || disclaimerType.includes("Fitness") ? `Testimonials and reviews on this website:
- Reflect individual experiences and opinions
- Are not representative of typical results
- Do not guarantee similar outcomes for others
- May not be verified or independently confirmed

Results vary based on individual circumstances, effort, and other factors beyond our control.` : "If we feature testimonials, they represent individual experiences and do not guarantee typical results. Your results may vary."}

## Changes to This Disclaimer

We reserve the right to modify this disclaimer at any time. Changes take effect immediately upon posting to this website.

Your continued use after changes constitutes acceptance of the updated disclaimer.

**Last Updated:** ${date}

## Governing Law

This disclaimer is governed by the laws of [Jurisdiction] without regard to conflict of law principles. Any disputes shall be resolved in the courts of [Jurisdiction].

## Severability

If any provision of this disclaimer is found invalid or unenforceable, the remaining provisions remain in full force and effect.

## Entire Agreement

This disclaimer, together with our Privacy Policy and Terms of Service, constitutes the entire agreement between you and ${data.websiteName || "us"} regarding use of this website.

## Contact Information

If you have questions about this disclaimer, contact us at:

**Email:** ${data.contactEmail || "contact@website.com"}

---

**Acknowledgment:** By using this website, you acknowledge that you have read, understood, and agree to this disclaimer.`;
}
