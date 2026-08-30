-- Rate limiting for document generation: one row per generation request,
-- counted per IP over a sliding 1-hour window by the API routes.
-- (001_entitlements.sql is already applied in production; run this separately.)

create table if not exists public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz default now()
);

create index if not exists generation_requests_ip_created_at_idx
  on public.generation_requests (ip, created_at);

-- RLS on with no policies: only the service-role key (used by API routes)
-- can read or write; the anon key is locked out entirely.
alter table public.generation_requests enable row level security;
