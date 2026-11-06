/**
 * Curated default photos for the 40 seed dishes, keyed by dish id (see mockDishes.ts).
 * A saved dish keeps whatever image URL the user stored; these are only the defaults.
 */

const UNSPLASH_PARAMS = "auto=format&fit=crop&w=1200&q=80";

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${UNSPLASH_PARAMS}`;
}

export const CURATED_DISH_IMAGE_URLS: Readonly<Record<string, string>> = {
  spaghetti: unsplash("photo-1621996346565-e3d5d628168e"),
  "vogels-zonder-kop": unsplash("photo-1544025162-d76694265947"),
  "kipschnitzel-appelmoes": unsplash("photo-1598515214211-89d3c73ae83b"),
  "mexicaanse-groenten-rijst": unsplash("photo-1543339308-43e59d6b73a6"),
  "curry-groene-bonen": unsplash("photo-1455619452474-d2be8b1e70cd"),
  lasagne: unsplash("photo-1574894709920-11b28e7367e3"),
  "fishsticks-spinaziepuree": unsplash("photo-1519708227418-c8fd9a32b7a2"),
  "rijst-wokgroenten": unsplash("photo-1512058564366-18510be2db19"),
  "couscous-worst-fruit": unsplash("photo-1585937421612-70a008356fbe"),
  "prei-aardappelen-vlees": unsplash("photo-1589301760014-d929f3979dbc"),
  "preistoemp-spek-ei": unsplash("photo-1525351484163-7529414344d8"),
  "vis-pommes-duchesse": unsplash("photo-1534422298391-e4f8c172dddb"),
  enchilada: unsplash("photo-1534352956036-cd81e27dd615"),
  "macaroni-kaassaus": unsplash("photo-1555949258-eb67b1ef0ceb"),
  "spruiten-spek-varkenshaasje": unsplash("photo-1504674900247-0877df9cc836"),
  pitta: unsplash("photo-1529006557810-274b9b2fc783"),
  "steak-saus-aardappelvariatie": unsplash("photo-1600891964599-f61ba0e24092"),
  "vol-au-vent-puree": unsplash("photo-1562967914-608f82629710"),
  "zwitserse-steak-puree": unsplash("photo-1588166524941-3bf61a9c41db"),
  "wraps-kipschnitzel-rauwkost": unsplash("photo-1626700051175-6818013e1d4f"),
  "colruyt-wokschotel": unsplash("photo-1569718212165-3a8278d5f624"),
  "boomstammetjes-gebakken-patatten": unsplash("photo-1544025162-d76694265947"),
  "de-schotel": unsplash("photo-1584947897587-21213f28cf9b"),
  "het-broodje": unsplash("photo-1528735602780-2552fd46c7af"),
  pastaschotel: unsplash("photo-1621996346565-e3d5d628168e"),
  "tortellini-vlees-broccoli": unsplash("photo-1551183053-bf91a1d81141"),
  "frietjes-stoofvlees": unsplash("photo-1585238342024-78d387f4a707"),
  "wortels-pasta-pepersaus-worst": unsplash("photo-1555949258-eb67b1ef0ceb"),
  "patapoefkes-fishsticks": unsplash("photo-1519708227418-c8fd9a32b7a2"),
  "pizza-diepvries": unsplash("photo-1513104890138-7c749659a591"),
  "curry-met-kip": unsplash("photo-1455619452474-d2be8b1e70cd"),
  "aardappelgratin-prei": unsplash("photo-1608897013039-887f21d8c804"),
  "ballekes-met-kriekskes": unsplash("photo-1529042410759-befb1204b468"),
  "varkenssneetjes-patatten-bloemkool": unsplash("photo-1544025162-d76694265947"),
  "koude-plat": unsplash("photo-1540420773420-3366772f4999"),
  "vol-au-vent-pasta-erwten": unsplash("photo-1563379091339-03b21ab4a4f8"),
  "forestiere-ardeens-gebraad": unsplash("photo-1504674900247-0877df9cc836"),
  "hamburgers-frieten": unsplash("photo-1568901346375-23c9450c58cd"),
  "black-pepper-udon": unsplash("photo-1569718212165-3a8278d5f624"),
  "hartige-balletjes-witloof": unsplash("photo-1529042410759-befb1204b468"),
};