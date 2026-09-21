-- Interpretation text served to the app. One row per content block (see
-- lib/content/bundled.ts for the keys). The app falls back to its built-in copy
-- when a row is missing, invalid, or the network is unavailable.
create table public.content_blocks (
  key text primary key,
  value jsonb not null,
  -- Bump only when a block's shape changes in a way older app versions can't read.
  schema_version int not null default 1,
  updated_at timestamptz not null default now()
);

create or replace function public.content_blocks_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger content_blocks_touch
before update on public.content_blocks
for each row execute function public.content_blocks_touch();

-- Read-only for the app; edits are made from the dashboard / service role only.
alter table public.content_blocks enable row level security;

create policy "content_blocks are readable by everyone"
on public.content_blocks for select
to anon, authenticated
using (true);
