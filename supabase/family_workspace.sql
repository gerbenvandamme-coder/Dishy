-- Shared family workspace: open read/write on the meal tables, realtime, and a shared photo bucket.
-- Run once in the Supabase SQL editor. Safe to run again.
--
-- Access model: the app has no login and uses the anon key, so the policies cover both anon and
-- authenticated. Anyone who holds the project's anon key can read and change this data.
-- Add Supabase Auth and narrow the roles below if the app is ever exposed beyond the family.

begin;

-- 1. Tables ---------------------------------------------------------------------------------
-- The app upserts its camelCase objects as they are, so these columns are quoted camelCase.
-- "create table if not exists" leaves tables you already have untouched.

create table if not exists public.dishes (
  id text primary key,
  name text not null,
  "imageUrl" text,
  "prepTime" text,
  category text not null default 'vaste_gerechten',
  ingredients jsonb not null default '[]'::jsonb,
  variations jsonb,
  notes text
);

create table if not exists public.weekly_meal_plan (
  date text primary key,
  "dayOfWeek" text,
  "dishId" text,
  "customNotes" text,
  "activeVariations" jsonb
);

create table if not exists public.custom_ingredients (
  id text primary key,
  name text not null check (char_length(name) between 1 and 60),
  pillar_id text not null,
  section text not null,
  ingredient_group text not null
    check (ingredient_group in ('basis', 'eiwit', 'groenten', 'saus', 'extra')),
  created_at timestamptz not null default now()
);

-- Older tables may lack the photo column and other optional columns.
alter table public.dishes
  add column if not exists "imageUrl" text,
  add column if not exists "prepTime" text,
  add column if not exists variations jsonb,
  add column if not exists notes text;

alter table public.weekly_meal_plan
  add column if not exists "dayOfWeek" text,
  add column if not exists "dishId" text,
  add column if not exists "customNotes" text,
  add column if not exists "activeVariations" jsonb;

-- A leftover NOT NULL user_id column would reject every insert from the app.
do $$
declare
  t text;
begin
  foreach t in array array['dishes', 'weekly_meal_plan', 'custom_ingredients'] loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = t
        and column_name = 'user_id'
        and is_nullable = 'NO'
    ) then
      execute format('alter table public.%I alter column user_id drop not null', t);
    end if;
  end loop;
end $$;

-- 2. Row-level security ---------------------------------------------------------------------
-- Drop every existing policy on these tables (including any "auth.uid() = user_id" ones),
-- then create one shared policy per command.

do $$
declare
  t text;
  p record;
begin
  foreach t in array array['dishes', 'weekly_meal_plan', 'custom_ingredients'] loop
    execute format('alter table public.%I enable row level security', t);

    for p in
      select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;

    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_family_select', t);
    execute format(
      'create policy %I on public.%I for insert to anon, authenticated with check (true)',
      t || '_family_insert', t);
    execute format(
      'create policy %I on public.%I for update to anon, authenticated using (true) with check (true)',
      t || '_family_update', t);
    execute format(
      'create policy %I on public.%I for delete to anon, authenticated using (true)',
      t || '_family_delete', t);

    execute format(
      'grant select, insert, update, delete on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- 3. Realtime -------------------------------------------------------------------------------
-- "alter publication ... add table" fails when the table is already published, so check first.

do $$
declare
  t text;
begin
  foreach t in array array['dishes', 'weekly_meal_plan', 'custom_ingredients'] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- 4. Storage: shared public bucket for dish photos ------------------------------------------
-- Public, so a photo URL opens on every device without a token.
-- Uploads are limited to 5 MB and to image types.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dish-images',
  'dish-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dish_images_select" on storage.objects;
create policy "dish_images_select" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'dish-images');

drop policy if exists "dish_images_insert" on storage.objects;
create policy "dish_images_insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'dish-images');

drop policy if exists "dish_images_update" on storage.objects;
create policy "dish_images_update" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'dish-images')
  with check (bucket_id = 'dish-images');

drop policy if exists "dish_images_delete" on storage.objects;
create policy "dish_images_delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'dish-images');

commit;