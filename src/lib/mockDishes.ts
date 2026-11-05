import type { Dish, Ingredient, IngredientGroup } from "@/types/dish";

/**
 * Seed data: 40 Belgian family dishes.
 *
 * Every ingredient sits in one pillar: basis (koolhydraten), eiwit (vlees, vis, veggie),
 * groenten (groenten en fruit), saus or extra.
 * A plain string is a default ingredient and starts selected.
 * opt("...") is an alternative or a toggle ("of Chipolata", "optionele hespblokjes"):
 * it starts unselected and is listed in the dish's `variations`.
 */

interface OptionalItem {
  name: string;
  optional: true;
}

type Item = string | OptionalItem;

type DishSpec = {
  id: string;
  name: string;
  notes?: string;
} & Partial<Record<IngredientGroup, Item[]>>;

/** Order in which the pillars are written to a dish. */
const GROUP_ORDER: readonly IngredientGroup[] = ["basis", "eiwit", "groenten", "saus", "extra"];

const opt = (name: string): OptionalItem => ({ name, optional: true });

/** "Forestière saus" -> "forestiere-saus". */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildDish(spec: DishSpec): Dish {
  const usedIds = new Set<string>();
  const variations: string[] = [];

  const ingredients = GROUP_ORDER.flatMap((group) =>
    (spec[group] ?? []).map((item): Ingredient => {
      const name = typeof item === "string" ? item : item.name;
      const optional = typeof item !== "string";

      // Ids are unique per ingredient: dish id + pillar + name, with a counter on a repeat.
      const baseId = `${spec.id}-${group}-${slugify(name)}`;
      let id = baseId;
      for (let n = 2; usedIds.has(id); n += 1) id = `${baseId}-${n}`;
      usedIds.add(id);

      if (optional) {
        variations.push(name);
        return { id, name, group, isOptional: true, isSelected: false };
      }
      return { id, name, group, isSelected: true };
    }),
  );

  return {
    id: spec.id,
    name: spec.name,
    category: "vaste_gerechten",
    ingredients,
    ...(variations.length > 0 ? { variations } : {}),
    ...(spec.notes ? { notes: spec.notes } : {}),
  };
}

const DISH_SPECS: DishSpec[] = [
  {
    id: "spaghetti",
    name: "Spaghetti",
    basis: ["Spaghetti"],
    eiwit: ["Gehakt"],
    groenten: ["Ui", "Wortel", "Tomatenblokjes", "Selder"],
    extra: ["Gemalen kaas", "Spaghettikruiden"],
  },
  {
    id: "vogels-zonder-kop",
    name: "Vogels zonder kop, erwten en wortel, aardappelen",
    basis: ["Gekookte aardappelen"],
    eiwit: ["Vogels zonder kop"],
    groenten: ["Erwten en wortelen"],
    saus: ["Braadjus"],
  },
  {
    id: "kipschnitzel-appelmoes",
    name: "Kipschnitzel, appelmoes, gebakken patatten",
    basis: ["Gebakken aardappelen"],
    eiwit: ["Kipschnitzel"],
    groenten: ["Appelmoes"],
  },
  {
    id: "mexicaanse-groenten-rijst",
    name: "Mexicaanse groenten, rijst",
    notes: "De Mexicaanse groentemix bevat maïs, paprika en kidneybonen.",
    basis: ["Rijst"],
    eiwit: ["Varkenssneetjes", opt("Chipolata"), opt("Kipschnitzel")],
    groenten: ["Mexicaanse groentemix"],
    extra: ["Mexicaanse kruiden"],
  },
  {
    id: "curry-groene-bonen",
    name: "Curry met groene bonen",
    notes: "De currysaus is gemaakt van kokosmelk en currypasta.",
    basis: ["Rijst"],
    groenten: ["Groene prinsessenboontjes", "Ui"],
    saus: ["Currysaus"],
  },
  {
    id: "lasagne",
    name: "Lasagne",
    basis: ["Lasagnebladen"],
    eiwit: ["Gemengd gehakt"],
    groenten: ["Ui", "Tomatenblokjes", "Wortel"],
    saus: ["Bechamelsaus", "Gratinkaas"],
  },
  {
    id: "fishsticks-spinaziepuree",
    name: "Fishsticks, spinaziepuree",
    basis: ["Pureeaardappelen", "Melk", "Boter"],
    eiwit: ["Fishsticks"],
    groenten: ["Roomspinazie"],
    extra: ["Nootmuskaat"],
  },
  {
    id: "rijst-wokgroenten",
    name: "Rijst, wokgroenten",
    notes: "De wokgroenten bestaan uit sojascheuten, paprika, wortel en ui.",
    basis: ["Wokrijst"],
    eiwit: ["Kipfilet", opt("Scampi")],
    groenten: ["Wokgroenten"],
    saus: ["Woksaus"],
  },
  {
    id: "couscous-worst-fruit",
    name: "Couscous, worst, fruit",
    basis: ["Couscous"],
    eiwit: ["Braadworsten"],
    groenten: ["Courgette", "Rozijnen", "Gedroogde abrikozen"],
  },
  {
    id: "prei-aardappelen-vlees",
    name: "Prei, aardappelen, vlees",
    basis: ["Gekookte aardappelen"],
    eiwit: ["Worst", opt("Biefstuk"), opt("Gebraad")],
    groenten: ["Prei"],
    saus: ["Witte bechamelsaus"],
  },
  {
    id: "preistoemp-spek-ei",
    name: "Preistoemp, spek & ei",
    basis: ["Pureeaardappelen"],
    eiwit: ["Spekblokjes", "Eieren"],
    groenten: ["Gestoofde prei"],
    extra: ["Boter", "Nootmuskaat"],
  },
  {
    id: "vis-pommes-duchesse",
    name: "Vis, pommes duchesse, broccoli/boontjes",
    basis: ["Pommes duchesse"],
    eiwit: ["Witvisfilet"],
    groenten: ["Broccoli", opt("Prinsessenboontjes")],
    saus: ["Citroen-botersaus"],
  },
  {
    id: "enchilada",
    name: "Enchilada",
    basis: ["Bloemwraps"],
    eiwit: ["Kipreepjes", opt("Gehakt")],
    groenten: ["Paprika", "Ui", "Mais", "Kidneybonen"],
    saus: ["Fajitasaus", "Gratinkaas"],
  },
  {
    id: "macaroni-kaassaus",
    name: "Macaroni, kaassaus, bloemkool, broccoli",
    basis: ["Macaroni"],
    groenten: ["Bloemkool", "Broccoli"],
    saus: ["Kaassaus"],
    extra: [opt("Hespblokjes")],
  },
  {
    id: "spruiten-spek-varkenshaasje",
    name: "Spruiten, spek, aardappelen, varkenshaasje",
    basis: ["Gekookte aardappelen"],
    eiwit: ["Varkenshaasje", "Spekblokjes"],
    groenten: ["Spruitjes"],
    saus: ["Vleesjus"],
  },
  {
    id: "pitta",
    name: "Pitta, brood/wraps, paprika",
    basis: ["Turks brood", opt("Pitabroodjes")],
    eiwit: ["Pittavlees"],
    groenten: ["Paprika", "Kropsla", "Ui"],
    saus: ["Knoflooksaus"],
  },
  {
    id: "steak-saus-aardappelvariatie",
    name: "Steak, saus, boontjes/sla, aardappelvariatie",
    basis: ["Aardappelnootjes", opt("Pommes duchesse"), opt("Wafeltjes")],
    eiwit: ["Biefstuk"],
    groenten: ["Groene boontjes", opt("Rauwkost")],
    saus: ["Champignonsaus", opt("Pepersaus")],
  },
  {
    id: "vol-au-vent-puree",
    name: "Vol-au-vent, puree, broccoli/bloemkool",
    basis: ["Aardappelpuree"],
    eiwit: ["Kip", "Soepballetjes"],
    groenten: ["Champignons", "Broccoli", opt("Bloemkool")],
    saus: ["Vol-au-ventsaus", "Bladerdeegkoekje"],
  },
  {
    id: "zwitserse-steak-puree",
    name: "Zwitserse steak, puree, spinazie",
    basis: ["Aardappelpuree"],
    eiwit: ["Zwitserse steak"],
    groenten: ["Spinazie"],
  },
  {
    id: "wraps-kipschnitzel-rauwkost",
    name: "Wraps met kipschnitzel, rauwkost",
    basis: ["Wraps"],
    eiwit: ["Kipschnitzel"],
    groenten: ["Kropsla", "Tomaat", "Wortel", "Komkommer"],
    saus: ["Saus naar keuze"],
  },
  {
    id: "colruyt-wokschotel",
    name: "Colruyt wokschotel (premade)",
    notes: "Voorverpakte wokgroenten- en vleesschotel van Colruyt.",
    basis: ["Woknoedels"],
    eiwit: ["Colruyt vleesschotel"],
    groenten: ["Colruyt wokgroenten"],
    saus: ["Bijgeleverde woksaus"],
  },
  {
    id: "boomstammetjes-gebakken-patatten",
    name: "Boomstammetjes, gebakken patatten, wortel/boontjes",
    basis: ["Gebakken aardappelen"],
    eiwit: ["Boomstammetjes"],
    groenten: ["Gestoofde worteltjes", opt("Prinsessenboontjes")],
  },
  {
    id: "de-schotel",
    name: "Dé schotel (eigen recept)",
    basis: ["Aardappelschijfjes"],
    eiwit: ["Gehakt"],
    groenten: ["Seizoensgroenten"],
    extra: ["Kaaskorst"],
  },
  {
    id: "het-broodje",
    name: "Het broodje",
    basis: ["Ciabatta", opt("Stokbrood")],
    eiwit: ["Kipfilet", "Mozzarella"],
    groenten: ["Gebakken paprika", "Ui", "Courgette"],
  },
  {
    id: "pastaschotel",
    name: "Pastaschotel",
    basis: ["Penne"],
    eiwit: ["Gehakt"],
    groenten: ["Paprika", "Wortel", "Ui", "Courgette"],
    saus: ["Tomatensaus", "Gratinkaas"],
  },
  {
    id: "tortellini-vlees-broccoli",
    name: "Tortellini, vlees, broccoli",
    basis: ["Tortellini"],
    eiwit: ["Boomstammetjes", opt("Worst"), opt("Kip")],
    groenten: ["Broccoli"],
    saus: ["Roomsaus"],
  },
  {
    id: "frietjes-stoofvlees",
    name: "Frietjes met stoofvlees/vol-au-vent/steak",
    basis: ["Frietjes"],
    eiwit: ["Stoofvlees", opt("Vol-au-vent"), opt("Steak")],
    groenten: ["Witloofsla", opt("Gemengde sla")],
    saus: ["Mayonaise"],
  },
  {
    id: "wortels-pasta-pepersaus-worst",
    name: "Wortels, pasta, pepersaus, worst",
    basis: ["Pasta"],
    eiwit: ["Braadworsten"],
    groenten: ["Gekookte wortelen"],
    saus: ["Warme pepersaus"],
  },
  {
    id: "patapoefkes-fishsticks",
    name: "Patapoefkes met fishsticks",
    notes: "Patapoefkes zijn aardappelbolletjes.",
    basis: ["Patapoefkes"],
    eiwit: ["Fishsticks"],
    groenten: ["Salade"],
    saus: ["Tartaarsaus"],
  },
  {
    id: "pizza-diepvries",
    name: "Pizza (diepvries)",
    basis: ["Diepvriespizza"],
  },
  {
    id: "curry-met-kip",
    name: "Curry met kip",
    basis: ["Zoete aardappel", "Rijst"],
    eiwit: ["Kipfilet", "Kikkererwten"],
    groenten: ["Bloemkool", "Paprika", "Verse gember"],
    saus: ["Kokosmelk", "Curry"],
  },
  {
    id: "aardappelgratin-prei",
    name: "Aardappelgratin, prei, vlees/vis",
    basis: ["Aardappelgratin"],
    eiwit: ["Vlees", opt("Witvis")],
    groenten: ["Gestoofde prei"],
  },
  {
    id: "ballekes-met-kriekskes",
    name: "Ballekes met kriekskes",
    basis: ["Brood", opt("Aardappelen")],
    eiwit: ["Gehaktballetjes"],
    groenten: ["Krieken op siroop"],
  },
  {
    id: "varkenssneetjes-patatten-bloemkool",
    name: "Varkenssneetjes, patatten, bloemkool",
    basis: ["Gekookte aardappelen"],
    eiwit: ["Varkenssneetjes"],
    groenten: ["Bloemkool"],
    saus: ["Witte saus"],
  },
  {
    id: "koude-plat",
    name: "Koude plat",
    basis: ["Stokbrood", opt("Koude aardappelsalade")],
    eiwit: ["Gekookte eieren", "Hesp", "Krabsalade"],
    groenten: ["Tomaat", "Komkommer", "Wortel", "Perziken uit blik"],
    saus: ["Mayonaise"],
  },
  {
    id: "vol-au-vent-pasta-erwten",
    name: "Vol-au-vent met pasta, erwten",
    basis: ["Spirelli"],
    eiwit: ["Kip", "Soepballetjes"],
    groenten: ["Doperwtjes", "Champignons"],
    saus: ["Vol-au-vent roomsaus"],
  },
  {
    id: "forestiere-ardeens-gebraad",
    name: "Forestière, gebakken aardappelen, ardeens gebraad",
    basis: ["Gebakken aardappelen"],
    eiwit: ["Ardeens gebraad"],
    groenten: ["Champignons"],
    saus: ["Forestière saus"],
  },
  {
    id: "hamburgers-frieten",
    name: "Hamburgers, frieten, rauwe groenten",
    basis: ["Frietjes", "Hamburgerbroodjes"],
    eiwit: ["Rundsburgers"],
    groenten: ["Kropsla", "Tomaat", "Augurk", "Ui"],
    saus: ["Burgersaus"],
  },
  {
    id: "black-pepper-udon",
    name: "Black pepper Udon noodles",
    basis: ["Udon noedels"],
    eiwit: ["Biefstukreepjes", opt("Kip")],
    groenten: ["Paprika", "Ui", "Lente-ui"],
    saus: ["Zwarte pepersaus"],
  },
  {
    id: "hartige-balletjes-witloof",
    name: "Hartige balletjes met witloof & puree (Jeroen Meus)",
    basis: ["Aardappelpuree"],
    eiwit: ["Gehaktballetjes"],
    groenten: ["Gekarameliseerd witloof"],
    saus: ["Vleesjus", opt("Biersaus")],
  },
];

export const INITIAL_DISHES: Dish[] = DISH_SPECS.map(buildDish);

/** Alias for existing imports (AppProvider, supabase). */
export const mockDishes: Dish[] = INITIAL_DISHES;