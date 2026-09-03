-- Public, config-only read for the widget. Returns just the widget config for a
-- given site_key — no owner data, no tokens. SECURITY DEFINER so it bypasses the
-- owner-only RLS on sites, but exposes only the four whitelisted fields.

create or replace function public.get_widget_config(p_site_key text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'accent', accent,
    'position', position,
    'features', features,
    'protection', protection,
    'statement_url', statement_url,
    'coordinator_name', coordinator_name,
    'coordinator_phone', coordinator_phone,
    'coordinator_email', coordinator_email
  )
  from public.sites
  where site_key = p_site_key
  limit 1;
$$;

-- The widget calls this unauthenticated (anon).
grant execute on function public.get_widget_config(text) to anon;
