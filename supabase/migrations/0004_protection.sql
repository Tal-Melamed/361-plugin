-- Per-site widget protection behaviors (applied by the widget via snippet data-*).
alter table public.sites
  add column if not exists protection jsonb not null default
    '{"protectMedia": true, "disableTextSelection": false, "removeTapHighlight": true, "disableLinkLongPress": true}'::jsonb;
