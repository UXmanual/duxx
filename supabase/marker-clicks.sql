create table if not exists public.marker_click_events (
  id uuid primary key default gen_random_uuid(),
  item_type text not null,
  item_id text not null,
  item_title text,
  session_id text,
  source text not null default 'map-marker',
  meta jsonb not null default '{}'::jsonb,
  clicked_at timestamptz not null default now()
);

create index if not exists marker_click_events_item_idx
  on public.marker_click_events (item_type, item_id);

create index if not exists marker_click_events_clicked_at_idx
  on public.marker_click_events (clicked_at desc);

create or replace view public.marker_popularity as
select
  item_type,
  item_id,
  max(item_title) as item_title,
  count(*)::bigint as click_count,
  max(clicked_at) as last_clicked_at
from public.marker_click_events
where source = 'map-marker'
group by item_type, item_id;

alter table public.marker_click_events enable row level security;

drop policy if exists "marker click insert public" on public.marker_click_events;
create policy "marker click insert public"
on public.marker_click_events
for insert
to anon, authenticated
with check (source = 'map-marker');

grant usage on schema public to anon, authenticated;
grant select on public.marker_popularity to anon, authenticated;
