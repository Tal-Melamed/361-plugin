-- Keep-alive: Supabase Free pauses a project after 7 days without *external* API
-- activity (internal pg_cron does NOT count). A scheduled GitHub Action calls the
-- ping() RPC every few days; ping() updates a single timestamp row, which is a
-- real write over the API and resets the inactivity clock.

create table if not exists public.keepalive (
  id smallint primary key default 1,
  last_ping timestamptz not null default now(),
  constraint keepalive_singleton check (id = 1)
);

insert into public.keepalive (id) values (1)
  on conflict (id) do nothing;

-- No RLS policies → anon cannot read/write the table directly. All access goes
-- through this SECURITY DEFINER RPC, which only touches the timestamp.
alter table public.keepalive enable row level security;

create or replace function public.ping()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  ts timestamptz;
begin
  update public.keepalive set last_ping = now() where id = 1
    returning last_ping into ts;
  return ts;
end;
$$;

grant execute on function public.ping() to anon;
