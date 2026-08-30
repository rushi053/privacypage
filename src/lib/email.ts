import { Resend } from "resend";

const DOC_TYPE_NAMES: Record<string, string> = {
  privacy: "Privacy Policy",
  tos: "Terms of Service",
  eula: "EULA",
  cookie: "Cookie Policy",
  disclaimer: "Disclaimer",
  bundle: "Bundle — All 5 Documents",
  "pro-single": "Pro — Any Single Document",
};

interface SendLicenseEmailParams {
  to: string;
  licenseKey: string;
  docType: string;
  documentId?: string;
}

/**
 * Emails the buyer their license key after a successful purchase. This must
 * NEVER fail the payment path: missing config no-ops with a loud console
 * error, and send failures are caught and logged.
 */
export async function sendLicenseEmail({ to, licenseKey, docType }: SendLicenseEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[email] RESEND_API_KEY is not set - license email NOT sent to ${to} (key ${licenseKey}). Set RESEND_API_KEY.`
    );
    return;
  }

  const productName = DOC_TYPE_NAMES[docType] || docType;

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Thanks for your purchase!</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
          You bought: <strong style="color:#111827;">${productName}</strong>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Your license key:</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
          <span style="font-family:ui-monospace,Menlo,monospace;font-size:18px;letter-spacing:2px;color:#4f46e5;font-weight:600;">${licenseKey}</span>
        </div>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
          Keep this key safe — it's your lifetime access. To restore your purchase on any device:
        </p>
        <ol style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#374151;line-height:1.8;">
          <li>Visit <a href="https://privacypage.io" style="color:#4f46e5;">privacypage.io</a></li>
          <li>Click <strong>Restore</strong> in the top menu</li>
          <li>Enter your license key</li>
        </ol>
        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
          Your license includes free lifetime regenerations — come back anytime laws change and regenerate an updated document at no cost.
        </p>
      </div>
      <p style="text-align:center;margin:24px 0 0;font-size:12px;color:#9ca3af;">
        <a href="https://privacypage.io" style="color:#9ca3af;">PrivacyPage</a> — legal docs for indie developers
      </p>
    </div>
  </body>
</html>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "PrivacyPage <receipts@privacypage.io>",
      to,
      subject: "Your PrivacyPage license key",
      html,
    });
    if (error) {
      console.error(`[email] license email to ${to} failed:`, error);
    }
  } catch (e) {
    console.error(`[email] license email to ${to} threw:`, e);
  }
}
