import type { Ingredient, IngredientGroup } from "@/types/dish";
import { createId, normalizeName, sameName } from "@/components/dishes/dishHelpers";

/** The dish being composed: ingredient names per group. Never mutated, always replaced. */
export type Draft = Record<IngredientGroup, readonly string[]>;

/** Order used for the generated title and the saved ingredient list. */
export const DRAFT_GROUPS: readonly IngredientGroup[] = ["eiwit", "basis", "groenten", "saus", "extra"];

export const EMPTY_DRAFT: Draft = { eiwit: [], basis: [], groenten: [], saus: [], extra: [] };

export function hasItem(draft: Draft, group: IngredientGroup, name: string): boolean {
  return draft[group].some((item) => sameName(item, name));
}

/** Adds the ingredient unless it is empty or already present in that group. */
export function addItem(draft: Draft, group: IngredientGroup, name: string): Draft {
  const clean = normalizeName(name);
  if (!clean || hasItem(draft, group, clean)) return draft;
  return { ...draft, [group]: [...draft[group], clean] };
}

export function toggleItem(draft: Draft, group: IngredientGroup, name: string): Draft {
  if (!hasItem(draft, group, name)) return addItem(draft, group, name);
  return { ...draft, [group]: draft[group].filter((item) => !sameName(item, name)) };
}

export function countItems(draft: Draft): number {
  return DRAFT_GROUPS.reduce((total, group) => total + draft[group].length, 0);
}

/** Builds a title such as "Biefstuk met frieten, witloofsalade en champignonsaus". */
export function suggestDishName(draft: Draft): string {
  const names = DRAFT_GROUPS.flatMap((group) => draft[group]);
  if (names.length === 0) return "";
  const [first, ...rest] = names;
  if (rest.length === 0) return first;
  const tail = rest.map((item) => item.toLocaleLowerCase("nl-BE"));
  const joined =
    tail.length === 1 ? tail[0] : `${tail.slice(0, -1).join(", ")} en ${tail[tail.length - 1]}`;
  return `${first} met ${joined}`;
}

export function draftToIngredients(draft: Draft): Ingredient[] {
  return DRAFT_GROUPS.flatMap((group) =>
    draft[group].map((name) => ({
      id: createId("ing"),
      name,
      group,
      isSelected: true,
    })),
  );
}