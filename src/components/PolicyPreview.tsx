"use client";

import { useState, useEffect, useCallback } from "react";
import { useRazorpay, isDocUnlocked } from "@/hooks/useRazorpay";
import { fetchGeoPricing, toSmallestUnit, type LocalPricing } from "@/lib/currency";
import EmailCaptureModal from "@/components/EmailCaptureModal";

interface PolicyPreviewProps {
  /** Preview text (new flow) or the full document (legacyFull fallback). */
  policy: string;
  formData: Record<string, string>;
  onReset: () => void;
  docType?: string;
  /** Set in the new flow: full content lives server-side under this id. */
  documentId?: string | null;
  /** Total line count of the server-side document (new flow only). */
  totalLines?: number;
}

// Shown blurred beneath the preview when the server holds the rest of the
// document: the real hidden lines never reach the browser before payment.
const PLACEHOLDER_BLUR_LINES = [
  "## Data Retention",
  "We retain personal information only for as long as necessary to provide the service and fulfill the purposes described in this document.",
  "",
  "## Your Rights",
  "- Right to access your personal data",
  "- Right to correction and deletion",
  "- Right to data portability",
  "",
  "## Contact Us",
  "For any questions about this document, contact our team.",
];

export default function PolicyPreview({ policy, formData, onReset, docType = "privacy", documentId, totalLines }: PolicyPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [pricing, setPricing] = useState<LocalPricing | null>(null);
  const [fullContent, setFullContent] = useState<string | null>(null);
  const { openPayment } = useRazorpay();

  useEffect(() => {
    let cancelled = false;
    fetchGeoPricing().then((p) => { if (!cancelled) setPricing(p); });
    return () => { cancelled = true; };
  }, []);

  const fetchFullDocument = useCallback(async (licenseKey: string) => {
    if (!documentId) return;
    try {
      const res = await fetch(`/api/document/${documentId}?license=${encodeURIComponent(licenseKey)}`);
      if (!res.ok) {
        console.error(`Full document fetch failed (${res.status})`);
        return;
      }
      const json = await res.json();
      if (json.content) {
        setFullContent(json.content);
        setShowFull(true);
        // Mirror the server entitlement locally. For a pro-single purchase the
        // server just claimed the license for this document and returned its
        // real doc type, so the correct per-docType flag gets written here.
        if (json.docType) {
          localStorage.setItem(`privacypage_unlocked_${json.docType}`, "true");
        }
      }
    } catch (e) {
      console.error("Full document fetch error:", e);
    }
  }, [documentId]);

  const docTypeNames: Record<string, string> = {
    privacy: "Privacy Policy",
    tos: "Terms of Service",
    eula: "EULA",
    cookie: "Cookie Policy",
    disclaimer: "Disclaimer",
  };

  useEffect(() => {
    const storedKey = localStorage.getItem("privacypage_license_key");
    if (isDocUnlocked(docType)) {
      setShowFull(true);
      // Already entitled (e.g. bundle bought earlier): pull the full content
      // for this freshly generated document with the stored license key.
      if (storedKey && documentId) fetchFullDocument(storedKey);
    } else if (storedKey && documentId) {
      // No local unlock flag, but a license exists - e.g. an unclaimed
      // pro-single purchase. Let the server decide: if entitled it claims the
      // license for this document and the fetch handler unlocks the UI.
      fetchFullDocument(storedKey);
    }
  }, [docType, documentId, fetchFullDocument]);

  // In the new flow `policy` is only the preview; after unlock we swap in the
  // full content fetched from the server. legacyFull responses are already full.
  const content = fullContent ?? policy;
  const lines = content.split("\n");
  const previewLines = lines.slice(0, 25);
  const remainingLines = lines.slice(25);
  const isPaid = showFull;
  // Lines that exist server-side but weren't sent to the client yet.
  const hiddenLineCount = fullContent === null && totalLines != null
    ? Math.max(totalLines - lines.length, 0)
    : 0;
  const hasLockedContent = remainingLines.length > 0 || hiddenLineCount > 0;
  const blurLines = remainingLines.length > 0 ? remainingLines.slice(0, 10) : PLACEHOLDER_BLUR_LINES;

  const handleUnlock = () => {
    if (!pricing) return;
    setShowEmailCapture(true);
  };

  const startUnlockPayment = (email: string) => {
    if (!pricing) return;
    setPaying(true);
    openPayment({
      docType,
      currency: pricing.currency,
      amount: toSmallestUnit(pricing.singlePrice, pricing.currency),
      description: `Unlock ${docTypeNames[docType]} - Full Document`,
      email,
      documentId: documentId ?? undefined,
      onSuccess: (licenseKey) => {
        if (licenseKey) fetchFullDocument(licenseKey);
        setShowFull(true);
        setPaying(false);
      },
      onFailure: () => {
        setPaying(false);
      },
    });
  };

  const handleCopy = () => {
    if (!isPaid) {
      handleUnlock();
      return;
    }
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: string) => {
    if (!isPaid) {
      handleUnlock();
      return;
    }
    let fileContent = content;
    const baseName = formData.appName || formData.serviceName || formData.websiteName || "document";
    const docTypeSlugs: Record<string, string> = {
      privacy: "privacy-policy",
      tos: "terms-of-service",
      eula: "eula",
      cookie: "cookie-policy",
      disclaimer: "disclaimer",
    };
    let filename = `${docTypeSlugs[docType]}-${baseName.toLowerCase().replace(/\s+/g, "-")}`;
    let mimeType = "text/plain";

    if (format === "html") {
      fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - ${formData.appName || "App"}</title>
  <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#333}h1{color:#111}h2{color:#222;margin-top:2em}h3{color:#333}</style>
</head>
<body>
${content.split("\n").map((l) => {
        if (l.startsWith("# ")) return `<h1>${l.slice(2)}</h1>`;
        if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
        if (l.startsWith("### ")) return `<h3>${l.slice(4)}</h3>`;
        if (l.startsWith("- ")) return `<li>${l.slice(2)}</li>`;
        if (l.trim() === "") return "";
        return `<p>${l}</p>`;
      }).join("\n")}
</body>
</html>`;
      filename += ".html";
      mimeType = "text/html";
    } else if (format === "md") {
      filename += ".md";
      mimeType = "text/markdown";
    } else {
      filename += ".txt";
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in">
      <div className="glass-card rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {docTypeNames[docType]} {formData.appName || formData.serviceName || formData.websiteName ? `for ${formData.appName || formData.serviceName || formData.websiteName}` : ""}
          </h3>
          <button
            onClick={onReset}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Start Over
          </button>
        </div>

        {/* Policy content */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 max-h-[500px] overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            {previewLines.map((line, i) => (
              <PolicyLine key={i} line={line} />
            ))}
            {!isPaid && hasLockedContent && (
              <>
                <div className="relative">
                  <div className="blur-overlay">
                    {blurLines.map((line, i) => (
                      <PolicyLine key={`blur-${i}`} line={line} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/95 p-6 rounded-xl border border-indigo-600 soft-shadow-lg">
                      <p className="text-lg font-semibold mb-2 text-gray-900">
                        🔒 Unlock Full Document
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Get the complete document with GDPR & CCPA sections
                      </p>
                      <button
                        onClick={handleUnlock}
                        disabled={paying || !pricing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {paying ? "Processing..." : `Unlock for ${pricing?.singleDisplay ?? "..."}`}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {isPaid &&
              remainingLines.map((line, i) => (
                <PolicyLine key={`full-${i}`} line={line} />
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-sm transition-colors text-gray-700 bg-white"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
          <button
            onClick={() => handleDownload("md")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-sm transition-colors text-gray-700 bg-white"
          >
            📄 Markdown
          </button>
          <button
            onClick={() => handleDownload("html")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-sm transition-colors text-gray-700 bg-white"
          >
            🌐 HTML
          </button>
          <button
            onClick={() => handleDownload("txt")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-sm transition-colors text-gray-700 bg-white"
          >
            📝 Plain Text
          </button>
        </div>
      </div>

      {showEmailCapture && (
        <EmailCaptureModal
          description={`Unlock ${docTypeNames[docType]} — full document, ${pricing?.singleDisplay ?? ""}`}
          onSubmit={(email) => {
            setShowEmailCapture(false);
            startUnlockPayment(email);
          }}
          onClose={() => setShowEmailCapture(false)}
        />
      )}
    </div>
  );
}

function PolicyLine({ line }: { line: string }) {
  if (line.startsWith("# "))
    return <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900">{line.slice(2)}</h1>;
  if (line.startsWith("## "))
    return <h2 className="text-xl font-semibold mt-5 mb-2 text-indigo-600">{line.slice(3)}</h2>;
  if (line.startsWith("### "))
    return <h3 className="text-lg font-medium mt-4 mb-1 text-gray-900">{line.slice(4)}</h3>;
  if (line.startsWith("- "))
    return (
      <div className="flex gap-2 ml-4 my-1 text-gray-700">
        <span className="text-gray-400">•</span>
        <span>{line.slice(2)}</span>
      </div>
    );
  if (line.trim() === "") return <div className="h-3" />;
  return <p className="text-gray-700 leading-relaxed my-2">{line}</p>;
}
