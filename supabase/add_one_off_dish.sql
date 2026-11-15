-- Adds support for one-off dishes in the weekly planner.
-- A one-off dish is stored inside the plan entry and never appears in the dish library.
-- Run once in the Supabase SQL editor. Safe to run again.

alter table public.weekly_meal_plan
  add column if not exists "oneOffDish" jsonb;
