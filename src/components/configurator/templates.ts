import type { IngredientGroup } from "@/types/dish";
import { EMPTY_DRAFT, addItem, type Draft } from "@/components/configurator/draft";

export interface TemplateIngredient {
  name: string;
  group: IngredientGroup;
}

export interface TemplateOption {
  label: string;
  /** Small explanation under the label. */
  hint?: string;
  /** Overrides the default of one ingredient named after the label, in the section group. */
  ingredients?: readonly TemplateIngredient[];
}

export interface TemplateSection {
  /** Unique within one template. */
  id: string;
  label: string;
  /** Group of the ingredients created by this section's options. */
  group: IngredientGroup;
  mode: "single" | "multi";
  required: boolean;
  options: readonly TemplateOption[];
}

export interface TemplateStep {
  id: string;
  title: string;
  description: string;
  sections: readonly TemplateSection[];
}

export interface DishTemplate {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  steps: readonly TemplateStep[];
}

export type Picks = Readonly<Record<string, readonly string[]>>;

function options(...labels: string[]): TemplateOption[] {
  return labels.map((label) => ({ label }));
}

export const DISH_TEMPLATES: readonly DishTemplate[] = [
  {
    id: "bistro",
    name: "De Frituur / Bistro",
    tagline: "Frieten, vlees en een frisse salade met saus",
    emoji: "🍟",
    steps: [
      {
        id: "basis",
        title: "Basis",
        description: "Kies de aardappelbereiding.",
        sections: [
          {
            id: "basis",
            label: "Basis",
            group: "basis",
            mode: "single",
            required: true,
            options: options("Frieten", "Aardappelnootjes", "Pommes Duchesse", "Aardappelwafeltjes"),
          },
        ],
      },
      {
        id: "eiwit",
        title: "Eiwit",
        description: "Kies het vlees.",
        sections: [
          {
            id: "eiwit",
            label: "Eiwit",
            group: "eiwit",
            mode: "single",
            required: true,
            options: options("Biefstuk", "Stoofvlees", "Vol-au-vent", "Hamburgers"),
          },
        ],
      },
      {
        id: "groente-saus",
        title: "Groente & Saus",
        description: "Kies een groente of salade en een saus.",
        sections: [
          {
            id: "groente",
            label: "Groente",
            group: "groenten",
            mode: "single",
            required: true,
            options: options("Witloofsalade", "Kropsla/tomaat", "Groene boontjes"),
          },
          {
            id: "saus",
            label: "Saus",
            group: "saus",
            mode: "single",
            required: true,
            options: options("Mayonaise", "Champignonsaus", "Pepersaus"),
          },
        ],
      },
    ],
  },
  {
    id: "klassiek",
    name: "Klassiek Vlaams",
    tagline: "Patatten, vlees en warme groente",
    emoji: "🥔",
    steps: [
      {
        id: "basis",
        title: "Basis",
        description: "Kies de aardappelbereiding.",
        sections: [
          {
            id: "basis",
            label: "Basis",
            group: "basis",
            mode: "single",
            required: true,
            options: options("Gekookte aardappelen", "Gebakken patatten", "Aardappelpuree"),
          },
        ],
      },
      {
        id: "eiwit",
        title: "Eiwit",
        description: "Kies het vlees.",
        sections: [
          {
            id: "eiwit",
            label: "Eiwit",
            group: "eiwit",
            mode: "single",
            required: true,
            options: options(
              "Worst/Chipolata",
              "Vogels zonder kop",
              "Boomstammetjes",
              "Varkenssneetjes",
              "Varkenshaasje",
              "Ardeens gebraad",
              "Zwitserse steak",
            ),
          },
        ],
      },
      {
        id: "groenten",
        title: "Groente",
        description: "Kies de warme groente.",
        sections: [
          {
            id: "groente",
            label: "Groente",
            group: "groenten",
            mode: "single",
            required: true,
            options: [
              { label: "Erwten & wortelen" },
              { label: "Prei", hint: "Gestoofd of in witte saus" },
              { label: "Spruiten met spek" },
              { label: "Bloemkool" },
              { label: "Broccoli" },
              { label: "Appelmoes" },
            ],
          },
        ],
      },
      {
        id: "saus",
        title: "Saus",
        description: "Kies de saus.",
        sections: [
          {
            id: "saus",
            label: "Saus",
            group: "saus",
            mode: "single",
            required: true,
            options: options("Braadjus", "Witte bechamelsaus"),
          },
        ],
      },
    ],
  },
  {
    id: "wok",
    name: "Wok, Rijst & Noodles",
    tagline: "Snel uit de wok met rijst of noedels",
    emoji: "🍜",
    steps: [
      {
        id: "basis",
        title: "Basis",
        description: "Kies de basis.",
        sections: [
          {
            id: "basis",
            label: "Basis",
            group: "basis",
            mode: "single",
            required: true,
            options: options("Wokrijst", "Udon noedels", "Couscous"),
          },
        ],
      },
      {
        id: "eiwit",
        title: "Eiwit",
        description: "Kies het eiwit.",
        sections: [
          {
            id: "eiwit",
            label: "Eiwit",
            group: "eiwit",
            mode: "single",
            required: true,
            options: options("Kipblokjes", "Scampi", "Varkensreepjes"),
          },
        ],
      },
      {
        id: "groente-saus",
        title: "Groente & Saus",
        description: "Kies de groente en de saus.",
        sections: [
          {
            id: "groente",
            label: "Groente",
            group: "groenten",
            mode: "single",
            required: true,
            options: [
              { label: "Wokgroenten", hint: "Sojascheuten, paprika en wortel" },
              { label: "Groene boontjes" },
            ],
          },
          {
            id: "saus",
            label: "Saus",
            group: "saus",
            mode: "single",
            required: true,
            options: options("Currysaus", "Black Pepper saus"),
          },
        ],
      },
    ],
  },
  {
    id: "pasta",
    name: "Pasta & Ovenschotel",
    tagline: "Pasta met saus, eventueel gegratineerd",
    emoji: "🍝",
    steps: [
      {
        id: "basis",
        title: "Basis",
        description: "Kies de pasta.",
        sections: [
          {
            id: "basis",
            label: "Basis",
            group: "basis",
            mode: "single",
            required: true,
            options: options("Spaghetti", "Penne", "Macaroni", "Tortellini"),
          },
        ],
      },
      {
        id: "saus",
        title: "Saus & Toppings",
        description: "Kies de saus.",
        sections: [
          {
            id: "saus",
            label: "Saus",
            group: "saus",
            mode: "single",
            required: true,
            options: [
              { label: "Kaassaus" },
              { label: "Fajita/Tomatensaus" },
              {
                label: "Roomsaus + Gratinkaas",
                ingredients: [
                  { name: "Roomsaus", group: "saus" },
                  { name: "Gratinkaas", group: "extra" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "extras",
        title: "Optionele extra's",
        description: "Vink aan wat erbij mag. Je kunt dit ook leeg laten.",
        sections: [
          {
            id: "extras",
            label: "Extra's",
            group: "extra",
            mode: "multi",
            required: false,
            options: [
              { label: "Hespblokjes" },
              { label: "Gehakt", ingredients: [{ name: "Gehakt", group: "eiwit" }] },
              { label: "Bloemkool", ingredients: [{ name: "Bloemkool", group: "groenten" }] },
              { label: "Broccoli", ingredients: [{ name: "Broccoli", group: "groenten" }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "streetfood",
    name: "Streetfood / Broodjes & Wraps",
    tagline: "Gevuld brood of wrap met rauwkost en saus",
    emoji: "🌯",
    steps: [
      {
        id: "basis",
        title: "Basis",
        description: "Kies het brood.",
        sections: [
          {
            id: "basis",
            label: "Basis",
            group: "basis",
            mode: "single",
            required: true,
            options: options("Wraps", "Turks brood", "Pitabroodjes", "Ciabatta"),
          },
        ],
      },
      {
        id: "eiwit",
        title: "Eiwit",
        description: "Kies de vulling.",
        sections: [
          {
            id: "eiwit",
            label: "Eiwit",
            group: "eiwit",
            mode: "single",
            required: true,
            options: options("Kipschnitzel", "Pitavlees", "Kipreepjes", "Mozzarella"),
          },
        ],
      },
      {
        id: "rauwkost-saus",
        title: "Rauwkost & Saus",
        description: "Kies de rauwkost en een saus.",
        sections: [
          {
            id: "rauwkost",
            label: "Rauwkost",
            group: "groenten",
            mode: "multi",
            required: false,
            options: options("Sla", "Tomaat", "Komkommer", "Geraspte wortel", "Paprika"),
          },
          {
            id: "saus",
            label: "Saus",
            group: "saus",
            mode: "single",
            required: true,
            options: options("Looksaus", "Mayonaise"),
          },
        ],
      },
    ],
  },
];

export function optionIngredients(
  option: TemplateOption,
  section: TemplateSection,
): readonly TemplateIngredient[] {
  return option.ingredients ?? [{ name: option.label, group: section.group }];
}

/** Turns the wizard picks into a draft, in the order the options are defined. */
export function draftFromPicks(template: DishTemplate, picks: Picks): Draft {
  let draft = EMPTY_DRAFT;
  for (const step of template.steps) {
    for (const section of step.sections) {
      const chosen = picks[section.id] ?? [];
      for (const option of section.options) {
        if (!chosen.includes(option.label)) continue;
        for (const ingredient of optionIngredients(option, section)) {
          draft = addItem(draft, ingredient.group, ingredient.name);
        }
      }
    }
  }
  return draft;
}