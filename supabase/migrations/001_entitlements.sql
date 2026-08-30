-- Phase 1 entitlements: server-side document storage + rebuilt purchases table.
-- Documents are stored server-side; clients only ever receive a 25-line preview
-- until entitlement (license key) is proven.

create extension if not exists pgcrypto;

-- Generated documents (full content lives ONLY here, never sent to the client unpaid)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null,
  inputs jsonb not null,
  content text not null,
  created_at timestamptz default now()
);

-- Preserve the pre-Phase-1 purchases table (old schema: payment_id/order_id columns).
-- Guarded so this migration is safe to re-run and safe on fresh databases.
do $$
begin
  if to_regclass('public.purchases') is not null
     and to_regclass('public.purchases_legacy') is null then
    alter table public.purchases rename to purchases_legacy;
  end if;
end $$;

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  license_key text not null,
  email text,
  doc_type text not null,
  amount int,
  currency text,
  status text default 'paid',
  document_id uuid references public.documents(id),
  created_at timestamptz default now()
);

create index if not exists purchases_license_key_idx on public.purchases (license_key);
create index if not exists purchases_email_idx on public.purchases (email);

-- RLS enabled with NO policies: only the service-role key (used by API routes)
-- can read or write these tables. The anon key gets nothing.
alter table public.documents enable row level security;
alter table public.purchases enable row level security;
