"use client";

import { useState, useEffect, useCallback } from "react";
import { useRazorpay, isDocUnlocked } from "@/hooks/useRazorpay";
import { fetchGeoPricing, toSmallestUnit, type LocalPricing } from "@/lib/currency";
import EmailCaptureModal from "@/components/EmailCaptureModal";
import { CheckIcon, CopyIcon, DownloadIcon, LockIcon, RefreshIcon, KeyIcon } from "@/components/ClauseIcons";

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
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
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
    setLicenseKey(storedKey);
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
  // Placeholder sections that already appear in the readable preview are
  // skipped so the masked part doesn't repeat a heading the user just read.
  const seenHeadings = new Set(lines.filter((l) => l.startsWith("## ")).map((l) => l.slice(3).trim().toLowerCase()));
  const placeholder: string[] = [];
  let skip = false;
  for (const l of PLACEHOLDER_BLUR_LINES) {
    if (l.startsWith("## ")) skip = seenHeadings.has(l.slice(3).trim().toLowerCase());
    if (!skip) placeholder.push(l);
  }
  const blurLines = remainingLines.length > 0 ? remainingLines.slice(0, 10) : placeholder;

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
        if (licenseKey) { setLicenseKey(licenseKey); fetchFullDocument(licenseKey); }
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

  const subject = formData.appName || formData.serviceName || formData.websiteName;
  let clauseNo = 0;
  const numbered = (arr: string[], keyPrefix: string) =>
    arr.map((line, i) => {
      const n = line.startsWith("## ") ? ++clauseNo : null;
      return <PolicyLine key={`${keyPrefix}-${i}`} line={line} n={n} />;
    });

  return (
    <div className="animate-in max-w-[880px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-[12px] text-seal mb-2">{isPaid ? "Unlocked · yours to keep" : "Free preview"}</p>
          <h3 className="font-display text-[28px] md:text-[32px] leading-[1.2] tracking-[-0.01em]">
            {docTypeNames[docType]}{subject ? <span className="text-ink/60"> for {subject}</span> : null}
          </h3>
        </div>
        <button onClick={onReset} className="h-10 px-4 rounded-[8px] border border-ink/15 hover:border-ink/30 text-[14px] text-ink/70 hover:text-ink inline-flex items-center gap-2 transition-colors">
          <RefreshIcon /> {isPaid ? "Regenerate" : "Start over"}
        </button>
      </div>

      {isPaid && (
        <div className="mb-6 rounded-[8px] border border-seal/30 bg-seal-tint p-4 md:p-6 flex flex-wrap items-center justify-between gap-4" role="status">
          <div className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-seal text-white flex items-center justify-center shrink-0"><CheckIcon /></span>
            <div>
              <p className="font-medium text-[16px]">Payment complete. The full document is unlocked.</p>
              <p className="text-[14px] text-ink/70">Copy it or download it below. Regenerate free whenever your app changes.</p>
            </div>
          </div>
          {licenseKey && (
            <div className="flex items-center gap-2 text-[14px]">
              <KeyIcon className="w-4 h-4 text-seal" />
              <span className="font-mono tracking-[0.04em] select-all bg-white border border-ink/10 rounded-[8px] px-2 py-1">{licenseKey}</span>
            </div>
          )}
        </div>
      )}

      {/* Document */}
      <div className="relative rounded-[8px] border border-ink/10 bg-white overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_40%_at_50%_0%,rgba(15,92,99,0.06),transparent_70%)]" />
        <div className={`relative doc-ruled px-6 md:px-16 py-8 md:py-12 font-doc text-[17px] leading-[1.6] text-ink/90 ${isPaid ? "max-h-[640px] overflow-y-auto" : ""}`}>
          {numbered(previewLines, "p")}
          {!isPaid && hasLockedContent && (
            <div className="relative mt-2" aria-hidden>
              <div className="blur-overlay">{numbered(blurLines, "b")}</div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 from-40% via-white/40 to-white" />
            </div>
          )}
          {isPaid && numbered(remainingLines, "f")}
        </div>

        {/* Sticky unlock bar */}
        {!isPaid && hasLockedContent && (
          <div className="sticky bottom-0 border-t border-ink/10 bg-white/95 backdrop-blur px-6 md:px-8 py-4 md:py-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 font-medium text-[16px]"><LockIcon className="w-4 h-4 text-seal" /> The rest of this document is yours after unlock</p>
              <p className="text-[14px] text-ink/60">
                {hiddenLineCount > 0 ? `${hiddenLineCount} more lines · ` : ""}One-time payment · HTML, Markdown and plain text · free regenerations
              </p>
            </div>
            <button
              onClick={handleUnlock}
              disabled={paying || !pricing}
              className="h-12 px-6 rounded-[8px] bg-seal hover:bg-seal-dark text-white text-[16px] font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {paying ? "Processing…" : `Unlock for ${pricing?.singleDisplay ?? "…"}`}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-6">
        {[
          { label: copied ? "Copied" : "Copy text", icon: copied ? <CheckIcon /> : <CopyIcon />, on: handleCopy },
          { label: "Markdown", icon: <DownloadIcon />, on: () => handleDownload("md") },
          { label: "HTML", icon: <DownloadIcon />, on: () => handleDownload("html") },
          { label: "Plain text", icon: <DownloadIcon />, on: () => handleDownload("txt") },
        ].map((b) => (
          <button key={b.label} onClick={b.on} className="h-12 px-4 inline-flex items-center gap-2 rounded-[8px] border border-ink/15 hover:border-ink/30 bg-white text-[14px] text-ink/80 transition-colors">
            {b.icon}{b.label}{!isPaid && <LockIcon className="w-4 h-4 text-ink/40" />}
          </button>
        ))}
      </div>

      {showEmailCapture && (
        <EmailCaptureModal
          description={`Unlock ${docTypeNames[docType]}: full document, ${pricing?.singleDisplay ?? ""} one-time.`}
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

function PolicyLine({ line, n }: { line: string; n?: number | null }) {
  if (line.startsWith("# "))
    return <h1 className="font-display text-[28px] md:text-[32px] leading-[1.2] tracking-[-0.01em] mt-0 mb-6 text-ink">{line.slice(2)}</h1>;
  if (line.startsWith("## "))
    return (
      <h2 className="font-display text-[20px] md:text-[22px] leading-[1.3] mt-8 mb-2 text-ink grid grid-cols-[48px_1fr]">
        <span className="font-mono text-[14px] leading-[2] text-seal">§ {n ?? ""}</span>
        <span>{line.slice(3)}</span>
      </h2>
    );
  if (line.startsWith("### "))
    return <h3 className="font-display text-[18px] mt-6 mb-2 text-ink md:pl-12">{line.slice(4)}</h3>;
  if (line.startsWith("- "))
    return (
      <div className="grid grid-cols-[16px_1fr] gap-2 md:pl-12 my-1">
        <span className="text-seal">–</span>
        <span>{line.slice(2)}</span>
      </div>
    );
  if (line.trim() === "") return <div className="h-4" />;
  return <p className="my-2 md:pl-12">{line}</p>;
}
