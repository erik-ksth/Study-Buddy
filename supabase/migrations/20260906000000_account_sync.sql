-- Study Buddy account data. Apply with `supabase db push` or paste into the
-- Supabase SQL editor. Browser clients only receive the publishable key; RLS
-- keeps every row scoped to the authenticated owner.

create extension if not exists pgcrypto;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null default '',
  is_completed boolean not null default false,
  due_time text not null default '--:-- --',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null default '',
  back text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.study_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'cream' check (theme in ('cream', 'midnight', 'forest', 'ocean', 'sakura')),
  updated_at timestamptz not null default now()
);

create index if not exists todos_user_position_idx on public.todos(user_id, position);
create index if not exists notes_user_position_idx on public.notes(user_id, position);
create index if not exists flashcards_user_position_idx on public.flashcards(user_id, position);

alter table public.todos enable row level security;
alter table public.notes enable row level security;
alter table public.flashcards enable row level security;
alter table public.study_stats enable row level security;
alter table public.user_preferences enable row level security;

revoke all on public.todos from anon;
revoke all on public.notes from anon;
revoke all on public.flashcards from anon;
revoke all on public.study_stats from anon;
revoke all on public.user_preferences from anon;

grant select, insert, update, delete on public.todos to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.flashcards to authenticated;
grant select, insert, update, delete on public.study_stats to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;

create policy "owners manage todos" on public.todos
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "owners manage notes" on public.notes
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "owners manage flashcards" on public.flashcards
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "owners manage study stats" on public.study_stats
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "owners manage preferences" on public.user_preferences
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
