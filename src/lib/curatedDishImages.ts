/**
 * Default photos for the 40 seed dishes, keyed by dish id (see mockDishes.ts).
 * A saved dish keeps whatever image URL the user stored; these are only the defaults.
 *
 * Every photo was picked by hand to show the actual dish. Sources: Pexels and Unsplash (free to use,
 * no attribution required) and Wikimedia Commons (license and author noted next to the entry).
 * supabase/migrations/update_dish_photos.sql writes the same URLs to the shared database.
 */

const PEXELS_PARAMS = "auto=compress&cs=tinysrgb&w=1200";
const UNSPLASH_PARAMS = "auto=format&fit=crop&w=1200&q=80";

function pexels(photoId: number): string {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?${PEXELS_PARAMS}`;
}

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${UNSPLASH_PARAMS}`;
}

export const CURATED_DISH_IMAGE_URLS: Readonly<Record<string, string>> = {
  spaghetti: unsplash("photo-1785396347369-b5e70e3f3af3"),
  // Wikimedia Commons, Égoïté, CC BY-SA 3.0
  "vogels-zonder-kop":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Oiseau-sans-tete_2.jpg/1280px-Oiseau-sans-tete_2.jpg",
  "kipschnitzel-appelmoes": pexels(1352270),
  "mexicaanse-groenten-rijst": pexels(7538054),
  "curry-groene-bonen": pexels(37283160),
  lasagne: unsplash("photo-1709429790175-b02bb1b19207"),
  "fishsticks-spinaziepuree": pexels(17199132),
  "rijst-wokgroenten": pexels(27588102),
  "couscous-worst-fruit": pexels(29594950),
  "prei-aardappelen-vlees": pexels(19503811),
  "preistoemp-spek-ei": pexels(19362403),
  "vis-pommes-duchesse": pexels(16134546),
  enchilada: pexels(34550456),
  "macaroni-kaassaus": pexels(806357),
  // Wikimedia Commons, Sarah Stierch (Missvain), CC BY 4.0
  "spruiten-spek-varkenshaasje":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Brussels_sprouts_with_pork_belly_-_2021-11-20_-_Sarah_Stierch.jpg/1280px-Brussels_sprouts_with_pork_belly_-_2021-11-20_-_Sarah_Stierch.jpg",
  pitta: pexels(6941000),
  "steak-saus-aardappelvariatie": pexels(36183178),
  // Wikimedia Commons, Hautbois, CC BY-SA 4.0
  "vol-au-vent-puree":
    "https://upload.wikimedia.org/wikipedia/commons/d/de/Vol-au-vent_20_cm.jpg",
  "zwitserse-steak-puree": pexels(34283283),
  "wraps-kipschnitzel-rauwkost": unsplash("photo-1626700051175-6818013e1d4f"),
  "colruyt-wokschotel": pexels(28895971),
  "boomstammetjes-gebakken-patatten": unsplash("photo-1748713092721-c6ba229e3ae3"),
  "de-schotel": unsplash("photo-1696935257293-9ec4f03074a1"),
  "het-broodje": pexels(17300435),
  pastaschotel: pexels(38103947),
  "tortellini-vlees-broccoli": unsplash("photo-1612548041144-af453bde331a"),
  // Wikimedia Commons, René Hourdry, CC0
  "frietjes-stoofvlees":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Carbonade_flamande_2023.jpg/1280px-Carbonade_flamande_2023.jpg",
  "wortels-pasta-pepersaus-worst": pexels(16010637),
  "patapoefkes-fishsticks": pexels(30882832),
  "pizza-diepvries": unsplash("photo-1534308983496-4fabb1a015ee"),
  "curry-met-kip": unsplash("photo-1708782344490-9026aaa5eec7"),
  "aardappelgratin-prei": pexels(34985106),
  // Wikimedia Commons, Hilke Arijs, CC BY-SA 4.0
  "ballekes-met-kriekskes":
    "https://upload.wikimedia.org/wikipedia/commons/1/11/Ballekes_met_kriekskes_2.jpg",
  "varkenssneetjes-patatten-bloemkool": pexels(28996273),
  "koude-plat": pexels(15419502),
  "vol-au-vent-pasta-erwten": pexels(33515064),
  "forestiere-ardeens-gebraad": pexels(37047946),
  "hamburgers-frieten": unsplash("photo-1561758033-d89a9ad46330"),
  "black-pepper-udon": pexels(24246680),
  "hartige-balletjes-witloof": pexels(20323448),
};
