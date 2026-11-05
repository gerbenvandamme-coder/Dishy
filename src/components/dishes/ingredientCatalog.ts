import type { IngredientGroup } from "@/types/dish";

/** The four groups a meal is composed from in the configurator. */
export type TrayGroup = Exclude<IngredientGroup, "extra">;

/** Tray order: Eiwit + Basis + Groente + Saus. */
export const TRAY_GROUPS: readonly TrayGroup[] = ["eiwit", "basis", "groenten", "saus"];

/** Ingredients offered per group in the configurator. */
export const INGREDIENT_CATALOG: Record<TrayGroup, readonly string[]> = {
  eiwit: [
    "Biefstuk",
    "Kippenfilet",
    "Gehaktbal",
    "Gekookte hesp",
    "Worst",
    "Zalm",
    "Vissticks",
    "Veggieburger",
  ],
  basis: ["Frietjes", "Puree", "Gekookte aardappelen", "Kroketten", "Pasta", "Rijst"],
  groenten: [
    "Witloof",
    "Witloofsalade",
    "Wortelen",
    "Broccoli",
    "Sperziebonen",
    "Erwtjes",
    "Sla",
    "Appelmoes",
  ],
  saus: ["Kaassaus", "Pepersaus", "Champignonsaus", "Tomatensaus", "Roomsaus"],
};