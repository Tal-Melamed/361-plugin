-- Widget heartbeat: the config RPC (called by the widget on every load) also
-- stamps last_seen, so the dashboard knows the widget is actually live —
-- reliably, for any install method (static or JS-injected). Throttled to ~30 min.

alter table public.sites add column if not exists last_seen timestamptz;

create or replace function public.get_widget_config(p_site_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.sites
    set last_seen = now()
    where site_key = p_site_key
      and (last_seen is null or last_seen < now() - interval '30 minutes');

  select jsonb_build_object(
    'accent', accent,
    'position', position,
    'features', features,
    'protection', protection,
    'statement_url', statement_url,
    'coordinator_name', coordinator_name,
    'coordinator_phone', coordinator_phone,
    'coordinator_email', coordinator_email
  ) into result
  from public.sites
  where site_key = p_site_key
  limit 1;

  return result;
end;
$$;

grant execute on function public.get_widget_config(text) to anon;
