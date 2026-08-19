-- Fix for: /api/tasks and /api/phone-time returning 500 Internal Server Error.
--
-- Root cause: data/taskStore.js and data/phoneTimeStore.js (and the RLS
-- policies they rely on) assume `tasks` and `phone_time_entries` each have
-- a `user_id` column that defaults to auth.uid() and is enforced by Row
-- Level Security. Confirmed earlier that `tasks` doesn't actually have a
-- `user_id` column in the real database (seeding via raw SQL failed with
-- "column user_id of relation tasks does not exist"). Without that column,
-- any RLS policy referencing user_id errors out on every query, which
-- Postgres surfaces as a generic server error -> our API routes catch it
-- and return 500.
--
-- Run this once in the Supabase dashboard: Project -> SQL Editor -> New
-- query -> paste this whole file -> Run.
--
-- Safe to re-run (every statement is idempotent / uses IF NOT EXISTS or
-- DROP POLICY IF EXISTS first).

-- 1. Add the missing column (nullable — NOT NULL would fail here if any
--    existing rows already exist with no owner; better to add it openly
--    and let RLS just hide unowned rows than to block the migration).
alter table public.tasks
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.phone_time_entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2. New rows should be owned by whoever inserts them, without every
--    INSERT having to set user_id explicitly (matches the comment in
--    data/taskStore.js / data/phoneTimeStore.js).
alter table public.tasks alter column user_id set default auth.uid();
alter table public.phone_time_entries alter column user_id set default auth.uid();

-- 3. Turn RLS on (no-op if already enabled).
alter table public.tasks enable row level security;
alter table public.phone_time_entries enable row level security;

-- 4. One row = one owner, enforced by Postgres itself.
drop policy if exists "Users can view own tasks" on public.tasks;
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own phone time" on public.phone_time_entries;
create policy "Users can view own phone time" on public.phone_time_entries
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own phone time" on public.phone_time_entries;
create policy "Users can insert own phone time" on public.phone_time_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own phone time" on public.phone_time_entries;
create policy "Users can update own phone time" on public.phone_time_entries
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own phone time" on public.phone_time_entries;
create policy "Users can delete own phone time" on public.phone_time_entries
  for delete using (auth.uid() = user_id);

-- NOTE: any rows that already existed before this migration (e.g. from
-- earlier local seeding attempts) will have user_id = NULL and will
-- become invisible under these policies — that's expected, not a bug.
-- If you want fresh sample data afterward, re-run
-- scripts/seedRandomTasks.mjs / scripts/seedPhoneTimeEntries.mjs, but note
-- those use the service-role key and currently don't set user_id either,
-- so seeded rows still won't show up for a signed-in user until they're
-- updated to accept a user id — say the word if you want that done too.
