-- Accessibility Plugin — sites table (per-customer widget config + legal fields)
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  domain text not null,
  -- URL-safe unique key embedded in the install snippet.
  site_key text not null unique default ('ak_' || encode(gen_random_bytes(12), 'hex')),
  accent text not null default '#000000',
  position text not null default 'bottom-left' check (position in ('bottom-left', 'bottom-right')),
  features jsonb not null default
    '{"fontSize":true,"highContrast":true,"grayscale":true,"highlightLinks":true,"bigCursor":true}'::jsonb,
  statement_url text,
  coordinator_name text,
  coordinator_email text,
  coordinator_phone text,
  created_at timestamptz not null default now()
);

create index if not exists sites_owner_id_idx on public.sites (owner_id);

-- Row Level Security: each user sees and manages only their own sites.
alter table public.sites enable row level security;

drop policy if exists "sites_select_own" on public.sites;
create policy "sites_select_own" on public.sites
  for select using (auth.uid() = owner_id);

drop policy if exists "sites_insert_own" on public.sites;
create policy "sites_insert_own" on public.sites
  for insert with check (auth.uid() = owner_id);

drop policy if exists "sites_update_own" on public.sites;
create policy "sites_update_own" on public.sites
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "sites_delete_own" on public.sites;
create policy "sites_delete_own" on public.sites
  for delete using (auth.uid() = owner_id);
