-- Google (Search Console + Analytics) OAuth connection, per site.
-- One grant covers both scopes; tokens refreshed server-side.

create table if not exists public.google_connections (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  google_email text,
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  gsc_site text,       -- selected Search Console property (e.g. sc-domain:example.com)
  ga_property text,    -- selected GA4 property id (e.g. properties/123456789)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_connections enable row level security;

-- Owner manages their own connections. (Read-only Google scopes; tokens are the
-- owner's own grant. Server functions read/write via the authenticated user.)
drop policy if exists "google_select_own" on public.google_connections;
create policy "google_select_own" on public.google_connections
  for select using (auth.uid() = owner_id);

drop policy if exists "google_insert_own" on public.google_connections;
create policy "google_insert_own" on public.google_connections
  for insert with check (auth.uid() = owner_id);

drop policy if exists "google_update_own" on public.google_connections;
create policy "google_update_own" on public.google_connections
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "google_delete_own" on public.google_connections;
create policy "google_delete_own" on public.google_connections
  for delete using (auth.uid() = owner_id);
