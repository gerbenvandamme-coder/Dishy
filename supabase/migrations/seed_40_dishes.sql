-- Seed the 40 Belgian family dishes with curated image URLs
-- This migration ensures all dishes from mockDishes.ts are in the public database

-- Enable public read/write access (RLS policies)
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON dishes;
CREATE POLICY "Enable read access for all users" ON dishes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON dishes;
CREATE POLICY "Enable insert for all users" ON dishes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON dishes;
CREATE POLICY "Enable update for all users" ON dishes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON dishes;
CREATE POLICY "Enable delete for all users" ON dishes FOR DELETE USING (true);

-- Seed all 40 dishes with their curated images
-- Using INSERT ... ON CONFLICT DO UPDATE to make this migration idempotent

INSERT INTO dishes (id, name, "imageUrl", category) VALUES
  ('spaghetti', 'Spaghetti', 'https://images.unsplash.com/photo-1621996346565-e3d5d628168e?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('vogels-zonder-kop', 'Vogels zonder kop, erwten en wortel, aardappelen', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('kipschnitzel-appelmoes', 'Kipschnitzel, appelmoes, gebakken patatten', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('mexicaanse-groenten-rijst', 'Mexicaanse groenten, rijst', 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('curry-groene-bonen', 'Curry met groene bonen', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('lasagne', 'Lasagne', 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('fishsticks-spinaziepuree', 'Fishsticks, spinaziepuree', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('rijst-wokgroenten', 'Rijst, wokgroenten', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('couscous-worst-fruit', 'Couscous, worst, fruit', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('prei-aardappelen-vlees', 'Prei, aardappelen, vlees', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('preistoemp-spek-ei', 'Preistoemp, spek & ei', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('vis-pommes-duchesse', 'Vis, pommes duchesse, broccoli/boontjes', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('enchilada', 'Enchilada', 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('macaroni-kaassaus', 'Macaroni, kaassaus, bloemkool, broccoli', 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('spruiten-spek-varkenshaasje', 'Spruiten, spek, aardappelen, varkenshaasje', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('pitta', 'Pitta, brood/wraps, paprika', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('steak-saus-aardappelvariatie', 'Steak, saus, boontjes/sla, aardappelvariatie', 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('vol-au-vent-puree', 'Vol-au-vent, puree, broccoli/bloemkool', 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('zwitserse-steak-puree', 'Zwitserse steak, puree, spinazie', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('wraps-kipschnitzel-rauwkost', 'Wraps met kipschnitzel, rauwkost', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('colruyt-wokschotel', 'Colruyt wokschotel (premade)', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('boomstammetjes-gebakken-patatten', 'Boomstammetjes, gebakken patatten, wortel/boontjes', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('de-schotel', 'Dé schotel (eigen recept)', 'https://images.unsplash.com/photo-1584947897587-21213f28cf9b?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('het-broodje', 'Het broodje', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('pastaschotel', 'Pastaschotel', 'https://images.unsplash.com/photo-1621996346565-e3d5d628168e?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('tortellini-vlees-broccoli', 'Tortellini, vlees, broccoli', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('frietjes-stoofvlees', 'Frietjes met stoofvlees/vol-au-vent/steak', 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('wortels-pasta-pepersaus-worst', 'Wortels, pasta, pepersaus, worst', 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('patapoefkes-fishsticks', 'Patapoefkes met fishsticks', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('pizza-diepvries', 'Pizza (diepvries)', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('curry-met-kip', 'Curry met kip', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('aardappelgratin-prei', 'Aardappelgratin, prei, vlees/vis', 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('ballekes-met-kriekskes', 'Ballekes met kriekskes', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('varkenssneetjes-patatten-bloemkool', 'Varkenssneetjes, patatten, bloemkool', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('koude-plat', 'Koude plat', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('vol-au-vent-pasta-erwten', 'Vol-au-vent met pasta, erwten', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('forestiere-ardeens-gebraad', 'Forestière, gebakken aardappelen, ardeens gebraad', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('hamburgers-frieten', 'Hamburgers, frieten, rauwe groenten', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('black-pepper-udon', 'Black pepper Udon noodles', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('hartige-balletjes-witloof', 'Hartige balletjes met witloof & puree (Jeroen Meus)', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "imageUrl" = COALESCE(EXCLUDED."imageUrl", dishes."imageUrl"),
  category = EXCLUDED.category;

-- Note: Full ingredient data (pillars: basis, eiwit, groenten, saus, extra) is managed
-- by the app's mockDishes.ts and synced via the Supabase client. This migration only
-- ensures the dish records exist with their curated image URLs.