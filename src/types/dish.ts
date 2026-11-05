/** How a dish is put together: a fixed recipe or one built from ingredient groups. */
export type DishCategory = "vaste_gerechten" | "geconfigureerd";

/**
 * Ingredient groups used by the configurator.
 * - basis: koolhydraten (pasta, aardappelen, puree, rijst, frietjes)
 * - eiwit: vlees, vis, veggie
 * - groenten: warme groenten, salades, appelmoes
 * - saus: kaassaus, pepersaus, champignonsaus, ...
 * - extra: spekjes, hespblokjes, croutons
 */
export type IngredientGroup = "basis" | "eiwit" | "groenten" | "saus" | "extra";

export interface Ingredient {
  id: string;
  name: string;
  group: IngredientGroup;
  isOptional?: boolean;
  isSelected?: boolean;
}

export interface Dish {
  id: string;
  name: string;
  imageUrl?: string;
  prepTime?: string;
  category: DishCategory;
  ingredients: Ingredient[];
  variations?: string[];
  notes?: string;
}

export interface WeeklyMealPlan {
  /** ISO date, e.g. "2026-11-04". */
  date: string;
  dayOfWeek: string;
  dishId?: string;
  customNotes?: string;
  activeVariations?: string[];
}