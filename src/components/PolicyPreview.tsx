"use client";

import { useState, useEffect } from "react";
import { useRazorpay, isDocUnlocked } from "@/hooks/useRazorpay";
import { getLocalPricing, toSmallestUnit } from "@/lib/currency";

interface PolicyPreviewProps {
  policy: string;
  formData: Record<string, string>;
  onReset: () => void;
  docType?: string;
}

export default function PolicyPreview({ policy, formData, onReset, docType = "privacy" }: PolicyPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [paying, setPaying] = useState(false);
  const { openPayment } = useRazorpay();
  const pricing = getLocalPricing();

  const docTypeNames: Record<string, string> = {
    privacy: "Privacy Policy",
    tos: "Terms of Service",
    eula: "EULA",
    cookie: "Cookie Policy",
    disclaimer: "Disclaimer",
  };

  useEffect(() => {
    if (isDocUnlocked(docType)) setShowFull(true);
  }, [docType]);

  const lines = policy.split("\n");
  const previewLines = lines.slice(0, 25);
  const remainingLines = lines.slice(25);
  const isPaid = showFull;

  const handleUnlock = () => {
    setPaying(true);
    openPayment({
      docType,
      currency: pricing.currency,
      amount: toSmallestUnit(pricing.singlePrice, pricing.currency),
      description: `Unlock ${docTypeNames[docType]} - Full Document`,
      onSuccess: () => {
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
    navigator.clipboard.writeText(policy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: string) => {
    if (!isPaid) {
      handleUnlock();
      return;
    }
    let content = policy;
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
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - ${formData.appName || "App"}</title>
  <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#333}h1{color:#111}h2{color:#222;margin-top:2em}h3{color:#333}</style>
</head>
<body>
${policy.split("\n").map((l) => {
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

    const blob = new Blob([content], { type: mimeType });
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
          <h3 className="text-xl font-semibold">
            {docTypeNames[docType]} {formData.appName || formData.serviceName || formData.websiteName ? `for ${formData.appName || formData.serviceName || formData.websiteName}` : ""}
          </h3>
          <button
            onClick={onReset}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Start Over
          </button>
        </div>

        {/* Policy content */}
        <div className="bg-zinc-900 rounded-xl p-6 mb-6 max-h-[500px] overflow-y-auto">
          <div className="prose prose-invert prose-sm max-w-none">
            {previewLines.map((line, i) => (
              <PolicyLine key={i} line={line} />
            ))}
            {!isPaid && remainingLines.length > 0 && (
              <>
                <div className="relative">
                  <div className="blur-overlay">
                    {remainingLines.slice(0, 10).map((line, i) => (
                      <PolicyLine key={`blur-${i}`} line={line} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-zinc-900/90 p-6 rounded-xl border border-indigo-500/30">
                      <p className="text-lg font-semibold mb-2">
                        🔒 Unlock Full Policy
                      </p>
                      <p className="text-sm text-zinc-400 mb-4">
                        Get the complete policy with GDPR, CCPA, Terms of Service & more
                      </p>
                      <button
                        onClick={handleUnlock}
                        disabled={paying}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {paying ? "Processing..." : `Unlock for ${pricing.singleDisplay}`}
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-sm transition-colors"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
          <button
            onClick={() => handleDownload("md")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-sm transition-colors"
          >
            📄 Markdown
          </button>
          <button
            onClick={() => handleDownload("html")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-sm transition-colors"
          >
            🌐 HTML
          </button>
          <button
            onClick={() => handleDownload("txt")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-sm transition-colors"
          >
            📝 Plain Text
          </button>
        </div>
      </div>
    </div>
  );
}

function PolicyLine({ line }: { line: string }) {
  if (line.startsWith("# "))
    return <h1 className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
  if (line.startsWith("## "))
    return <h2 className="text-xl font-semibold mt-5 mb-2 text-indigo-300">{line.slice(3)}</h2>;
  if (line.startsWith("### "))
    return <h3 className="text-lg font-medium mt-4 mb-1">{line.slice(4)}</h3>;
  if (line.startsWith("- "))
    return (
      <div className="flex gap-2 ml-4 my-1 text-zinc-300">
        <span className="text-zinc-500">•</span>
        <span>{line.slice(2)}</span>
      </div>
    );
  if (line.trim() === "") return <div className="h-3" />;
  return <p className="text-zinc-300 leading-relaxed my-2">{line}</p>;
}
