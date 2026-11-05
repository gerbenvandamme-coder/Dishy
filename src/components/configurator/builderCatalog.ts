import type { IngredientGroup } from "@/types/dish";

export interface BuilderSection {
  label: string;
  group: IngredientGroup;
  options: readonly string[];
}

export interface BuilderPillar {
  id: string;
  title: string;
  hint: string;
  sections: readonly BuilderSection[];
}

/** The four pillars of the free-form builder. */
export const BUILDER_PILLARS: readonly BuilderPillar[] = [
  {
    id: "eiwit",
    title: "Eiwit",
    hint: "Vlees, vis of veggie",
    sections: [
      {
        label: "Vlees",
        group: "eiwit",
        options: [
          "Biefstuk",
          "Kippenfilet",
          "Kipschnitzel",
          "Gehaktbal",
          "Hamburgers",
          "Varkenshaasje",
          "Gekookte hesp",
          "Worst",
        ],
      },
      { label: "Vis", group: "eiwit", options: ["Zalm", "Vissticks", "Scampi", "Kabeljauw"] },
      {
        label: "Veggie",
        group: "eiwit",
        options: ["Veggieburger", "Tofu", "Falafel", "Mozzarella"],
      },
    ],
  },
  {
    id: "basis",
    title: "Basis",
    hint: "Aardappelen, pasta of rijst",
    sections: [
      {
        label: "Aardappelen",
        group: "basis",
        options: ["Frieten", "Puree", "Gekookte aardappelen", "Gebakken patatten", "Kroketten"],
      },
      { label: "Pasta", group: "basis", options: ["Spaghetti", "Penne", "Macaroni", "Tortellini"] },
      { label: "Rijst", group: "basis", options: ["Witte rijst", "Basmatirijst", "Wokrijst"] },
    ],
  },
  {
    id: "groenten",
    title: "Groenten & Fruit",
    hint: "Warme groenten, salades en fruit",
    sections: [
      {
        label: "Warme groenten",
        group: "groenten",
        options: ["Witloof", "Wortelen", "Broccoli", "Bloemkool", "Sperziebonen", "Erwtjes", "Prei", "Spruitjes"],
      },
      {
        label: "Salade & rauwkost",
        group: "groenten",
        options: ["Witloofsalade", "Sla", "Tomaat", "Komkommer", "Paprika"],
      },
      { label: "Fruit", group: "groenten", options: ["Appelmoes", "Appel"] },
    ],
  },
  {
    id: "sauzen",
    title: "Sauzen & Extra's",
    hint: "Saus en toppings",
    sections: [
      {
        label: "Sauzen",
        group: "saus",
        options: [
          "Kaassaus",
          "Pepersaus",
          "Champignonsaus",
          "Tomatensaus",
          "Roomsaus",
          "Braadjus",
          "Mayonaise",
          "Looksaus",
          "Currysaus",
        ],
      },
      {
        label: "Extra's",
        group: "extra",
        options: ["Spekjes", "Hespblokjes", "Croutons", "Gratinkaas"],
      },
    ],
  },
];