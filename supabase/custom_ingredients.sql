-- Shared ingredients added in the configurator. Run once in the Supabase SQL editor.

create table if not exists public.custom_ingredients (
  id text primary key,
  name text not null check (char_length(name) between 1 and 60),
  pillar_id text not null,
  section text not null,
  ingredient_group text not null
    check (ingredient_group in ('basis', 'eiwit', 'groenten', 'saus', 'extra')),
  created_at timestamptz not null default now()
);

alter table public.custom_ingredients enable row level security;

-- The app has no login and uses the anon key, so anon needs read, add and delete access.
drop policy if exists "custom_ingredients_select" on public.custom_ingredients;
create policy "custom_ingredients_select" on public.custom_ingredients
  for select to anon using (true);

drop policy if exists "custom_ingredients_insert" on public.custom_ingredients;
create policy "custom_ingredients_insert" on public.custom_ingredients
  for insert to anon with check (true);

drop policy if exists "custom_ingredients_delete" on public.custom_ingredients;
create policy "custom_ingredients_delete" on public.custom_ingredients
  for delete to anon using (true);

-- Lets other open sessions see new ingredients without a reload.
-- Skip this line if the table is already part of the publication.
alter publication supabase_realtime add table public.custom_ingredients;