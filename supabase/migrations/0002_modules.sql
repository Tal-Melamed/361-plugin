-- Maestro platform — per-site module enablement.
-- One plugin, independent modules; each site turns modules on/off.

alter table public.sites
  add column if not exists modules jsonb not null default
    '{"accessibility": true, "seo": false}'::jsonb;
