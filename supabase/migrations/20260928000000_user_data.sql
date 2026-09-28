-- Server storage for logged-in users: 사주 목록 (people) and 학습 진도 (progress), plus a
-- 30-day grace period for account deletion. Guests never touch these tables; the app is
-- fully usable without an account (see privacy policy §1-5 in lib/legal.ts).

-- One row per saved person (including "나"). The device is the unit of truth for *shape*
-- (see lib/people.ts Person type); this table mirrors it as jsonb so the two stay in sync
-- without a second schema to maintain by hand.
create table public.people (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,
  -- Soft delete: a tombstone is a row with deleted_at set, so a device that saw the person
  -- before syncing can tell "removed elsewhere" apart from "never existed". Cheap enough to
  -- keep forever at this scale (a few hundred rows per user at most).
  deleted_at timestamptz,
  updated_at timestamptz not null default now()
);

create index people_user_id_idx on public.people (user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger people_touch_updated_at
before update on public.people
for each row execute function public.touch_updated_at();

alter table public.people enable row level security;

create policy "people are only visible to their owner"
on public.people for select
to authenticated
using (user_id = (select auth.uid()));

create policy "people are only writable by their owner"
on public.people for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "people are only updatable by their owner"
on public.people for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "people are only deletable by their owner"
on public.people for delete
to authenticated
using (user_id = (select auth.uid()));

-- One row per user: which lessons are completed (lib/lessons.ts ids).
create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  completed_lesson_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger progress_touch_updated_at
before update on public.progress
for each row execute function public.touch_updated_at();

alter table public.progress enable row level security;

create policy "progress is only visible to its owner"
on public.progress for select
to authenticated
using (user_id = (select auth.uid()));

create policy "progress is only writable by its owner"
on public.progress for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "progress is only updatable by its owner"
on public.progress for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- 계정 삭제: 요청 시각만 남기고, 30일 뒤 예약 작업이 auth.users를 지운다(아래 함수).
-- FK가 on delete cascade라서 auth.users가 지워지면 people/progress/이 테이블 행도 함께 지워진다.
-- 유예 기간 안에 다시 로그인하면 앱이 이 행을 지워서 삭제를 취소한다(lib/auth.ts cancelAccountDeletion).
create table public.deletion_requests (
  user_id uuid primary key references auth.users (id) on delete cascade,
  requested_at timestamptz not null default now()
);

alter table public.deletion_requests enable row level security;

create policy "a user can request their own deletion"
on public.deletion_requests for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "a user can see their own deletion request"
on public.deletion_requests for select
to authenticated
using (user_id = (select auth.uid()));

create policy "a user can cancel their own deletion request"
on public.deletion_requests for delete
to authenticated
using (user_id = (select auth.uid()));

-- Runs as the function owner (postgres), which can modify auth.users; callers only need
-- EXECUTE, never direct access to auth or to other users' deletion_requests rows.
create or replace function public.purge_expired_account_deletions()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users
  where id in (
    select user_id from public.deletion_requests
    where requested_at < now() - interval '30 days'
  );
end;
$$;

-- Requires the pg_cron extension (Database → Extensions in the dashboard). If it isn't
-- available on the project's plan, run purge_expired_account_deletions() on a schedule some
-- other way (e.g. a Supabase Edge Function on a Cron Trigger) instead of this block.
create extension if not exists pg_cron;

select
  cron.schedule(
    'purge-expired-account-deletions',
    '0 3 * * *', -- daily at 03:00 UTC
    $$select public.purge_expired_account_deletions()$$
  )
where not exists (
  select 1 from cron.job where jobname = 'purge-expired-account-deletions'
);
