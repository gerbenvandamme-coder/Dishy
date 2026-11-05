import type { Dish, IngredientGroup } from "@/types/dish";

export interface Pillar {
  group: IngredientGroup;
  /** Section title in the modal and configurator. */
  title: string;
  /** Short label on the dish card. */
  badge: string;
  /** One-line explanation of what belongs in the group. */
  hint: string;
}

export const PILLAR_BY_GROUP: Record<IngredientGroup, Pillar> = {
  basis: { group: "basis", title: "Basis", badge: "Basis", hint: "Koolhydraten" },
  eiwit: { group: "eiwit", title: "Eiwit", badge: "Eiwit", hint: "Vlees, vis of veggie" },
  groenten: {
    group: "groenten",
    title: "Groenten & fruit",
    badge: "Groente",
    hint: "Warme groenten, salades, appelmoes",
  },
  saus: { group: "saus", title: "Saus", badge: "Saus", hint: "Kaassaus, pepersaus, champignonsaus" },
  extra: { group: "extra", title: "Extra", badge: "Extra", hint: "Spekjes, hespblokjes, croutons" },
};

function pillarsFor(groups: readonly IngredientGroup[]): Pillar[] {
  return groups.map((group) => PILLAR_BY_GROUP[group]);
}

/** The four pillars shown as badges on a dish card. */
export const CARD_PILLARS = pillarsFor(["basis", "eiwit", "groenten", "saus"]);

/** The pillars shown in the detail modal. "Extra" holds optional toppings such as hespblokjes. */
export const DETAIL_PILLARS = pillarsFor(["basis", "eiwit", "groenten", "saus", "extra"]);

/** Pillars that have at least one ingredient in this dish. */
export function pillarsInDish(dish: Dish): Pillar[] {
  return CARD_PILLARS.filter((pillar) =>
    dish.ingredients.some((ingredient) => ingredient.group === pillar.group),
  );
}

/** Trims and collapses whitespace. */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** Case-insensitive comparison of two names. */
export function sameName(a: string, b: string): boolean {
  return normalizeName(a).toLowerCase() === normalizeName(b).toLowerCase();
}

/** Returns the URL when it is a valid http(s) URL, otherwise undefined. */
export function safeImageUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Creates a unique id. Falls back when crypto.randomUUID is unavailable (non-secure contexts). */
export function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${random}`;
}