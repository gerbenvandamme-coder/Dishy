import type { IngredientGroup } from "@/types/dish";

/** An ingredient added by a user in the configurator. Shared with everyone on the same database. */
export interface CustomIngredient {
  /** Deterministic from pillar, subcategory and name, so the same ingredient is never stored twice. */
  id: string;
  name: string;
  /** The builder pillar it belongs to, e.g. "eiwit". */
  pillarId: string;
  /** Label of the subcategory inside that pillar, e.g. "Vis". */
  section: string;
  /** The dish ingredient group it is saved under. */
  group: IngredientGroup;
  /** ISO timestamp. */
  createdAt: string;
}

export interface NewCustomIngredient {
  pillarId: string;
  section: string;
  group: IngredientGroup;
  name: string;
}