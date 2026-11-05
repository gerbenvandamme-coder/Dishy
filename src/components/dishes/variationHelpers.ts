import type { Ingredient, IngredientGroup } from "@/types/dish";
import { sameName } from "@/components/dishes/dishHelpers";

/** True when an optional ingredient is switched on through a variation with the same name. */
function isSwitchedOn(ingredient: Ingredient, activeVariations: readonly string[]): boolean {
  return Boolean(ingredient.isOptional) && activeVariations.some((variation) => sameName(variation, ingredient.name));
}

/** Pillars in which an optional ingredient is currently switched on. */
function groupsWithActiveOptional(
  ingredients: readonly Ingredient[],
  activeVariations: readonly string[],
): Set<IngredientGroup> {
  const groups = new Set<IngredientGroup>();
  for (const ingredient of ingredients) {
    if (isSwitchedOn(ingredient, activeVariations)) groups.add(ingredient.group);
  }
  return groups;
}

/**
 * Whether an ingredient counts for the dish right now.
 * - An optional ingredient counts when its variation is switched on.
 * - A default ingredient is replaced as soon as an optional one in the same pillar is switched on.
 */
export function isIngredientActive(
  ingredient: Ingredient,
  ingredients: readonly Ingredient[],
  activeVariations: readonly string[],
): boolean {
  if (ingredient.isOptional) return isSwitchedOn(ingredient, activeVariations);
  return !groupsWithActiveOptional(ingredients, activeVariations).has(ingredient.group);
}

/**
 * Returns the new list of active variations after toggling `name`.
 * Switching on an optional ingredient switches off the other optional ingredients of the same
 * pillar, but only when that pillar has a default ingredient to replace (worst -> biefstuk -> gebraad).
 * A pillar with only optional ingredients (e.g. optional hespblokjes) simply adds them.
 */
export function toggleActiveVariation(
  ingredients: readonly Ingredient[],
  activeVariations: readonly string[],
  name: string,
): string[] {
  if (activeVariations.some((variation) => sameName(variation, name))) {
    return activeVariations.filter((variation) => !sameName(variation, name));
  }

  const target = ingredients.find((ingredient) => ingredient.isOptional && sameName(ingredient.name, name));
  const hasDefault =
    target !== undefined &&
    ingredients.some((ingredient) => !ingredient.isOptional && ingredient.group === target.group);

  if (!target || !hasDefault) return [...activeVariations, name];

  const rivals = ingredients.filter(
    (ingredient) => ingredient.isOptional && ingredient.group === target.group,
  );
  const kept = activeVariations.filter(
    (variation) => !rivals.some((rival) => sameName(rival.name, variation)),
  );
  return [...kept, name];
}