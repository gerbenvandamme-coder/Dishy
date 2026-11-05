import type { Dish } from "@/types/dish";

/** Lowercases, trims and strips accents, so "ingrediënt" matches "ingredient". */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Splits a query into normalized words. An empty query gives an empty list. */
export function parseSearchTerms(query: string): string[] {
  const normalized = normalizeSearchText(query);
  return normalized ? normalized.split(/\s+/) : [];
}

/** True when every search word occurs in the dish name or in one of its ingredients. */
export function dishMatchesTerms(dish: Dish, terms: readonly string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = normalizeSearchText(
    [dish.name, ...dish.ingredients.map((ingredient) => ingredient.name)].join("\n"),
  );
  return terms.every((term) => haystack.includes(term));
}

/** Names of the ingredients that contain at least one search word. */
export function matchedIngredientNames(dish: Dish, terms: readonly string[]): string[] {
  if (terms.length === 0) return [];
  return dish.ingredients
    .filter((ingredient) => {
      const name = normalizeSearchText(ingredient.name);
      return terms.some((term) => name.includes(term));
    })
    .map((ingredient) => ingredient.name);
}