# PrivacyPage — Deployment Guide

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL (REST API base) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service-role key; API routes use it against RLS-locked tables (`documents`, `purchases`, `generation_requests`) |
| `SUPABASE_ANON_KEY` | Fallback only | Used only if the service-role key is missing (RLS tables will NOT work) |
| `OPENROUTER_API_KEY` | Yes | Primary LLM (Kimi via OpenRouter) for document generation |
| `ANTHROPIC_API_KEY` | Yes | Fallback LLM (Claude Haiku) when OpenRouter fails |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API key id (order create / verify) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret (order create, signature verification) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Same key id, exposed to the client checkout |
| `RAZORPAY_WEBHOOK_SECRET` | **New** | Secret configured on the Razorpay webhook; verifies `X-Razorpay-Signature`. Webhook returns 503 until set |
| `RESEND_API_KEY` | **New** | Resend API key for license-key emails. Missing key logs an error and skips the email (payments still succeed) |

## Database migrations (Supabase SQL editor)

1. `supabase/migrations/001_entitlements.sql` — **already applied in production.** Do not re-run.
2. `supabase/migrations/002_rate_limits.sql` — **must be run.** Creates `public.generation_requests` (per-IP generation rate limiting, 10/hour), its index, and enables RLS with no policies.

## Razorpay webhook setup

1. Razorpay Dashboard → Settings → Webhooks → Add New Webhook.
2. Webhook URL: `https://privacypage.io/api/webhook/razorpay`
3. Active events: `payment.captured`
4. Set a strong webhook secret and put the same value in the `RAZORPAY_WEBHOOK_SECRET` env var.

The webhook is a safety net: it redeems paid orders (creates the purchase row and emails the license) even when the buyer's browser never completed the client-side verify call. Redemption is idempotent per `razorpay_order_id`, so webhook + client verify double-processing is harmless.

## Resend setup

1. Create the domain `privacypage.io` in Resend (Domains → Add Domain) and add the DNS records it gives you (SPF + DKIM) — emails send from `receipts@privacypage.io` and will not deliver until the domain is verified.
2. Create an API key and set `RESEND_API_KEY`.

## Manual test script (after deploy)

1. **Generate** — pick a doc type, fill the wizard, generate. Confirm the preview renders.
2. **Preview-only check** — in browser dev tools → Network, inspect the `/api/generate*` response: it must contain only `documentId`, `preview` (25 lines), and `totalLines` — never the full document.
3. **Email field** — click an unlock/buy button; the email modal must appear and reject an invalid email.
4. **Pay** — complete a Razorpay test payment. Confirm the checkout was prefilled with your email.
5. **Unlock** — after payment, the full document must render, and copy/download must work.
6. **License email** — the license-key email should arrive at the address you entered (from `receipts@privacypage.io`).
7. **Restore** — clear localStorage (or use another browser), click Restore, enter the license key or email, confirm access is restored.
8. **Regenerate** — `POST /api/document/<documentId>/regenerate` with body `{"licenseKey":"PP-XXXXXXXX"}`; expect fresh `content` for the same inputs. (No UI is wired to this yet.)
9. **Rate limit** — generate 11 documents within an hour from one IP; the 11th must return 429 with a friendly message in the UI.
10. **Geo pricing** — from an Indian IP the site shows ₹849/₹2099; elsewhere $9.99/$24.99 (localhost defaults to INR since Vercel's geo header is absent).
