import type { ReactNode } from "react";

// Split a markdown line into inline tokens. Used by the policy preview and
// the HTML download, which previously rendered **bold** (and similar) as
// literal asterisks because they only handled heading/list prefixes.
const INLINE_TOKEN = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function isSafeHref(href: string): boolean {
  return /^(https?:|mailto:|\/|#)/i.test(href.trim());
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type InlinePart =
  | { type: "text"; value: string }
  | { type: "strong" | "em" | "code"; value: string }
  | { type: "link"; text: string; href: string };

function tokenizeInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ type: "text", value: text.slice(last, idx) });
    const tok = m[0];
    if (tok.startsWith("**") && tok.endsWith("**")) {
      parts.push({ type: "strong", value: tok.slice(2, -2) });
    } else if (tok.startsWith("`") && tok.endsWith("`")) {
      parts.push({ type: "code", value: tok.slice(1, -1) });
    } else if (tok.startsWith("*") && tok.endsWith("*")) {
      parts.push({ type: "em", value: tok.slice(1, -1) });
    } else {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (lm && isSafeHref(lm[2])) {
        parts.push({ type: "link", text: lm[1], href: lm[2].trim() });
      } else {
        parts.push({ type: "text", value: tok });
      }
    }
    last = idx + tok.length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  if (parts.length === 0) parts.push({ type: "text", value: text });
  return parts;
}

export function renderInlineMarkdown(text: string): ReactNode {
  const parts = tokenizeInline(text);
  if (parts.length === 1 && parts[0].type === "text") return parts[0].value;
  return parts.map((p, i) => {
    if (p.type === "text") return p.value;
    if (p.type === "strong") return <strong key={i}>{p.value}</strong>;
    if (p.type === "em") return <em key={i}>{p.value}</em>;
    if (p.type === "code") return <code key={i}>{p.value}</code>;
    if (p.type === "link") {
      return (
        <a key={i} href={p.href} className="underline underline-offset-2">
          {p.text}
        </a>
      );
    }
    return p.value;
  });
}

export function inlineMarkdownToHtml(text: string): string {
  return tokenizeInline(text)
    .map((p) => {
      if (p.type === "text") return escapeHtml(p.value);
      if (p.type === "strong") return `<strong>${escapeHtml(p.value)}</strong>`;
      if (p.type === "em") return `<em>${escapeHtml(p.value)}</em>`;
      if (p.type === "code") return `<code>${escapeHtml(p.value)}</code>`;
      if (p.type === "link") return `<a href="${escapeHtml(p.href)}">${escapeHtml(p.text)}</a>`;
      return "";
    })
    .join("");
}
