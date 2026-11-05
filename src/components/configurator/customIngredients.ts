import { normalizeName } from "@/components/dishes/dishHelpers";

/** Same pillar, subcategory and name (ignoring case) always give the same id. */
export function customIngredientId(pillarId: string, section: string, name: string): string {
  return `${pillarId}:${section}:${normalizeName(name).toLowerCase()}`;
}