import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Dish, IngredientGroup, WeeklyMealPlan } from "@/types/dish";
import type { CustomIngredient } from "@/types/customIngredient";
import { mockDishes } from "@/lib/mockDishes";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DISHES_TABLE = "dishes";
const MEAL_PLAN_TABLE = "weekly_meal_plan";

const DISHES_STORAGE_KEY = "dishy:dishes";
const MEAL_PLAN_STORAGE_KEY = "dishy:meal-plan";

/**
 * createClient throws on a missing or malformed URL, so a half-configured
 * .env must not crash the app. In that case we return null and every data
 * function below uses localStorage only.
 */
function createSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.warn("[supabase] Invalid configuration, using localStorage instead.", error);
    return null;
  }
}

/** The Supabase client, or null when the environment variables are missing or invalid. */
export const supabase: SupabaseClient | null = createSupabaseClient();

export const isSupabaseConfigured = supabase !== null;

/* ------------------------------------------------------------------ */
/* localStorage helpers (safe on the server, in private mode, on quota errors) */
/* ------------------------------------------------------------------ */

function readLocal<T>(key: string): T[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

function writeLocal<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Could not write "${key}".`, error);
  }
}

/* ------------------------------------------------------------------ */
/* Dishes                                                             */
/* ------------------------------------------------------------------ */

/**
 * Loads dishes from Supabase when it is configured and returns rows.
 * On an error or an empty table it falls back to localStorage, which is
 * seeded with the mock dishes on first use.
 */
export async function getDishes(): Promise<Dish[]> {
  if (supabase) {
    const { data, error } = await supabase.from(DISHES_TABLE).select("*");
    if (error) {
      console.warn("[supabase] Could not load dishes, using localStorage.", error.message);
    } else if (data && data.length > 0) {
      const dishes = data as Dish[];
      writeLocal(DISHES_STORAGE_KEY, dishes);
      return dishes;
    }
  }

  const local = readLocal<Dish>(DISHES_STORAGE_KEY);
  if (local) return local;

  writeLocal(DISHES_STORAGE_KEY, mockDishes);
  return mockDishes;
}

/** Saves dishes to localStorage first, then syncs to Supabase when configured. */
export async function saveDishes(dishes: Dish[]): Promise<void> {
  writeLocal(DISHES_STORAGE_KEY, dishes);
  if (!supabase) return;

  const { error } = await supabase.from(DISHES_TABLE).upsert(dishes, { onConflict: "id" });
  if (error) {
    console.warn("[supabase] Could not sync dishes, kept in localStorage.", error.message);
  }
}

/**
 * Removes one dish from Supabase when it is configured.
 * localStorage is updated by saveDishes, so call both when deleting.
 */
export async function deleteDish(id: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from(DISHES_TABLE).delete().eq("id", id);
  if (error) {
    console.warn("[supabase] Could not delete dish remotely.", error.message);
  }
}

/* ------------------------------------------------------------------ */
/* Weekly meal plan                                                   */
/* ------------------------------------------------------------------ */

/** Loads the meal plan with the same remote-then-local strategy as getDishes. */
export async function getMealPlan(): Promise<WeeklyMealPlan[]> {
  if (supabase) {
    const { data, error } = await supabase.from(MEAL_PLAN_TABLE).select("*");
    if (error) {
      console.warn("[supabase] Could not load meal plan, using localStorage.", error.message);
    } else if (data && data.length > 0) {
      const plan = data as WeeklyMealPlan[];
      writeLocal(MEAL_PLAN_STORAGE_KEY, plan);
      return plan;
    }
  }

  return readLocal<WeeklyMealPlan>(MEAL_PLAN_STORAGE_KEY) ?? [];
}

/** Saves the meal plan to localStorage first, then syncs to Supabase when configured. */
export async function saveMealPlan(plan: WeeklyMealPlan[]): Promise<void> {
  writeLocal(MEAL_PLAN_STORAGE_KEY, plan);
  if (!supabase) return;

  const { error } = await supabase.from(MEAL_PLAN_TABLE).upsert(plan, { onConflict: "date" });
  if (error) {
    console.warn("[supabase] Could not sync meal plan, kept in localStorage.", error.message);
  }
}

/**
 * Removes one day from the remote meal plan when Supabase is configured.
 * saveMealPlan only upserts, so a cleared day needs an explicit delete.
 */
export async function deleteMealPlanEntry(date: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from(MEAL_PLAN_TABLE).delete().eq("date", date);
  if (error) {
    console.warn("[supabase] Could not delete meal plan entry remotely.", error.message);
  }
}

/* ------------------------------------------------------------------ */
/* Custom ingredients                                                 */
/* ------------------------------------------------------------------ */

const CUSTOM_INGREDIENTS_TABLE = "custom_ingredients";
const CUSTOM_INGREDIENTS_STORAGE_KEY = "dishy:custom-ingredients";

/** Database row shape (snake_case) of the custom_ingredients table. */
interface CustomIngredientRow {
  id: string;
  name: string;
  pillar_id: string;
  section: string;
  ingredient_group: string;
  created_at: string;
}

function rowToCustomIngredient(row: CustomIngredientRow): CustomIngredient {
  return {
    id: row.id,
    name: row.name,
    pillarId: row.pillar_id,
    section: row.section,
    group: row.ingredient_group as IngredientGroup,
    createdAt: row.created_at,
  };
}

function customIngredientToRow(item: CustomIngredient): CustomIngredientRow {
  return {
    id: item.id,
    name: item.name,
    pillar_id: item.pillarId,
    section: item.section,
    ingredient_group: item.group,
    created_at: item.createdAt,
  };
}

/** Loads the shared ingredient list from Supabase, or from localStorage when that is unavailable. */
export async function getCustomIngredients(): Promise<CustomIngredient[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from(CUSTOM_INGREDIENTS_TABLE)
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("[supabase] Could not load custom ingredients, using localStorage.", error.message);
    } else {
      const items = ((data ?? []) as CustomIngredientRow[]).map(rowToCustomIngredient);
      writeLocal(CUSTOM_INGREDIENTS_STORAGE_KEY, items);
      return items;
    }
  }

  return readLocal<CustomIngredient>(CUSTOM_INGREDIENTS_STORAGE_KEY) ?? [];
}

/** Stores one ingredient in localStorage first, then upserts it remotely when configured. */
export async function saveCustomIngredient(item: CustomIngredient): Promise<void> {
  const local = readLocal<CustomIngredient>(CUSTOM_INGREDIENTS_STORAGE_KEY) ?? [];
  if (!local.some((existing) => existing.id === item.id)) {
    writeLocal(CUSTOM_INGREDIENTS_STORAGE_KEY, [...local, item]);
  }
  if (!supabase) return;

  const { error } = await supabase
    .from(CUSTOM_INGREDIENTS_TABLE)
    .upsert(customIngredientToRow(item), { onConflict: "id" });
  if (error) {
    console.warn("[supabase] Could not sync custom ingredient, kept in localStorage.", error.message);
  }
}

/** Removes one ingredient from localStorage and, when configured, from Supabase. */
export async function deleteCustomIngredient(id: string): Promise<void> {
  const local = readLocal<CustomIngredient>(CUSTOM_INGREDIENTS_STORAGE_KEY) ?? [];
  writeLocal(
    CUSTOM_INGREDIENTS_STORAGE_KEY,
    local.filter((existing) => existing.id !== id),
  );
  if (!supabase) return;

  const { error } = await supabase.from(CUSTOM_INGREDIENTS_TABLE).delete().eq("id", id);
  if (error) {
    console.warn("[supabase] Could not delete custom ingredient remotely.", error.message);
  }
}

/**
 * Calls onChange whenever another session changes the custom_ingredients table.
 * Returns a function that stops listening. Without Supabase it does nothing.
 */
export function subscribeToCustomIngredients(onChange: () => void): () => void {
  const client = supabase;
  if (!client) return () => {};

  const channel = client
    .channel("custom-ingredients-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: CUSTOM_INGREDIENTS_TABLE },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}