import type { Dish, Ingredient, IngredientGroup, WeeklyMealPlan } from "@/types/dish";
import { normalizeName } from "@/components/dishes/dishHelpers";
import { isIngredientActive } from "@/components/dishes/variationHelpers";

export type DepartmentId = "vers" | "groenten" | "droog" | "sauzen";

export interface ShoppingItem {
  /** Stable key, used to remember what has been checked off. */
  key: string;
  name: string;
  /** How many planned days need this ingredient. */
  count: number;
  dishNames: string[];
}

export interface ShoppingDepartment {
  id: DepartmentId;
  title: string;
  items: ShoppingItem[];
}

const DEPARTMENTS: readonly { id: DepartmentId; title: string }[] = [
  { id: "vers", title: "Versmarkt / Vlees" },
  { id: "groenten", title: "Groenten / Fruit" },
  { id: "droog", title: "Droge voeding / Koolhydraten" },
  { id: "sauzen", title: "Sauzen / Kruiden" },
];

/** Extras that are sold fresh (cold cuts, bacon, cheese) instead of with the sauces. */
const FRESH_EXTRA_KEYWORDS = ["hesp", "spek", "ham", "worst", "kaas"];

function departmentFor(group: IngredientGroup, name: string): DepartmentId {
  switch (group) {
    case "eiwit":
      return "vers";
    case "groenten":
      return "groenten";
    case "basis":
      return "droog";
    case "saus":
      return "sauzen";
    case "extra": {
      const lower = name.toLowerCase();
      return FRESH_EXTRA_KEYWORDS.some((keyword) => lower.includes(keyword)) ? "vers" : "sauzen";
    }
  }
}

/**
 * An optional ingredient is only needed when its variation is switched on.
 * A default ingredient is not needed when an optional one in the same pillar replaces it.
 */
function isNeeded(
  ingredient: Ingredient,
  ingredients: readonly Ingredient[],
  activeVariations: string[],
): boolean {
  if (!ingredient.isOptional && ingredient.isSelected === false) return false;
  return isIngredientActive(ingredient, ingredients, activeVariations);
}

/** Combines the ingredients of all planned dishes into one list per supermarket department. */
export function buildShoppingList(entries: WeeklyMealPlan[], dishes: Dish[]): ShoppingDepartment[] {
  const dishById = new Map(dishes.map((dish) => [dish.id, dish] as const));
  const buckets = new Map<DepartmentId, Map<string, ShoppingItem>>();

  for (const entry of entries) {
    const dish = entry.dishId ? dishById.get(entry.dishId) : undefined;
    if (!dish) continue;
    const activeVariations = entry.activeVariations ?? [];

    for (const ingredient of dish.ingredients) {
      if (!isNeeded(ingredient, dish.ingredients, activeVariations)) continue;
      const name = normalizeName(ingredient.name);
      if (!name) continue;

      const department = departmentFor(ingredient.group, name);
      const key = `${department}:${name.toLowerCase()}`;
      const bucket = buckets.get(department) ?? new Map<string, ShoppingItem>();
      buckets.set(department, bucket);

      const existing = bucket.get(key);
      if (existing) {
        existing.count += 1;
        if (!existing.dishNames.includes(dish.name)) existing.dishNames.push(dish.name);
      } else {
        bucket.set(key, { key, name, count: 1, dishNames: [dish.name] });
      }
    }
  }

  return DEPARTMENTS.flatMap(({ id, title }) => {
    const bucket = buckets.get(id);
    if (!bucket) return [];
    const items = [...bucket.values()].sort((a, b) => a.name.localeCompare(b.name, "nl"));
    return [{ id, title, items }];
  });
}

/* ------------------------------------------------------------------ */
/* Checked-off items, remembered per week in localStorage              */
/* ------------------------------------------------------------------ */

const CHECKED_STORAGE_KEY = "dishy:shopping-checked";

/** Maps a week start date to the keys of the items checked off in that week. */
export type CheckedByWeek = Record<string, string[]>;

export function loadChecked(): CheckedByWeek {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CHECKED_STORAGE_KEY);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as CheckedByWeek)
      : {};
  } catch {
    return {};
  }
}

export function saveChecked(checked: CheckedByWeek): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHECKED_STORAGE_KEY, JSON.stringify(checked));
  } catch (error) {
    console.warn("[storage] Could not save the shopping list.", error);
  }
}