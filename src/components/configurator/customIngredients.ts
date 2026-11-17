import { normalizeName } from "@/components/dishes/dishHelpers";

/** Same pillar, subcategory and name (ignoring case) always give the same id. */
export function customIngredientId(pillarId: string, section: string, name: string): string {
  return `${pillarId}:${section}:${normalizeName(name).toLowerCase()}`;
}
/**
 * A built-in option that someone removed in edit mode. It is stored as a row in the shared
 * custom_ingredients table with this id prefix, so the whole family sees it disappear and
 * no database change is needed.
 */
export const HIDDEN_PREFIX = "verborgen:";

export function hiddenIngredientId(pillarId: string, section: string, name: string): string {
  return `${HIDDEN_PREFIX}${customIngredientId(pillarId, section, name)}`;
}

export function isHiddenMarker(id: string): boolean {
  return id.startsWith(HIDDEN_PREFIX);
}
