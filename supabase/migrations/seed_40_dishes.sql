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
  ('spaghetti', 'Spaghetti', 'https://images.unsplash.com/photo-1785396347369-b5e70e3f3af3?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('vogels-zonder-kop', 'Vogels zonder kop, erwten en wortel, aardappelen', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Oiseau-sans-tete_2.jpg/1280px-Oiseau-sans-tete_2.jpg', 'vaste_gerechten'),
  ('kipschnitzel-appelmoes', 'Kipschnitzel, appelmoes, gebakken patatten', 'https://images.pexels.com/photos/1352270/pexels-photo-1352270.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('mexicaanse-groenten-rijst', 'Mexicaanse groenten, rijst', 'https://images.pexels.com/photos/7538054/pexels-photo-7538054.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('curry-groene-bonen', 'Curry met groene bonen', 'https://images.pexels.com/photos/37283160/pexels-photo-37283160.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('lasagne', 'Lasagne', 'https://images.unsplash.com/photo-1709429790175-b02bb1b19207?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('fishsticks-spinaziepuree', 'Fishsticks, spinaziepuree', 'https://images.pexels.com/photos/17199132/pexels-photo-17199132.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('rijst-wokgroenten', 'Rijst, wokgroenten', 'https://images.pexels.com/photos/27588102/pexels-photo-27588102.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('couscous-worst-fruit', 'Couscous, worst, fruit', 'https://images.pexels.com/photos/29594950/pexels-photo-29594950.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('prei-aardappelen-vlees', 'Prei, aardappelen, vlees', 'https://images.pexels.com/photos/19503811/pexels-photo-19503811.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('preistoemp-spek-ei', 'Preistoemp, spek & ei', 'https://images.pexels.com/photos/19362403/pexels-photo-19362403.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('vis-pommes-duchesse', 'Vis, pommes duchesse, broccoli/boontjes', 'https://images.pexels.com/photos/16134546/pexels-photo-16134546.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('enchilada', 'Enchilada', 'https://images.pexels.com/photos/34550456/pexels-photo-34550456.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('macaroni-kaassaus', 'Macaroni, kaassaus, bloemkool, broccoli', 'https://images.pexels.com/photos/806357/pexels-photo-806357.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('spruiten-spek-varkenshaasje', 'Spruiten, spek, aardappelen, varkenshaasje', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Brussels_sprouts_with_pork_belly_-_2021-11-20_-_Sarah_Stierch.jpg/1280px-Brussels_sprouts_with_pork_belly_-_2021-11-20_-_Sarah_Stierch.jpg', 'vaste_gerechten'),
  ('pitta', 'Pitta, brood/wraps, paprika', 'https://images.pexels.com/photos/6941000/pexels-photo-6941000.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('steak-saus-aardappelvariatie', 'Steak, saus, boontjes/sla, aardappelvariatie', 'https://images.pexels.com/photos/36183178/pexels-photo-36183178.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('vol-au-vent-puree', 'Vol-au-vent, puree, broccoli/bloemkool', 'https://upload.wikimedia.org/wikipedia/commons/d/de/Vol-au-vent_20_cm.jpg', 'vaste_gerechten'),
  ('zwitserse-steak-puree', 'Zwitserse steak, puree, spinazie', 'https://images.pexels.com/photos/34283283/pexels-photo-34283283.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('wraps-kipschnitzel-rauwkost', 'Wraps met kipschnitzel, rauwkost', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('colruyt-wokschotel', 'Colruyt wokschotel (premade)', 'https://images.pexels.com/photos/28895971/pexels-photo-28895971.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('boomstammetjes-gebakken-patatten', 'Boomstammetjes, gebakken patatten, wortel/boontjes', 'https://images.unsplash.com/photo-1748713092721-c6ba229e3ae3?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('de-schotel', 'Dé schotel (eigen recept)', 'https://images.unsplash.com/photo-1696935257293-9ec4f03074a1?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('het-broodje', 'Het broodje', 'https://images.pexels.com/photos/17300435/pexels-photo-17300435.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('pastaschotel', 'Pastaschotel', 'https://images.pexels.com/photos/38103947/pexels-photo-38103947.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('tortellini-vlees-broccoli', 'Tortellini, vlees, broccoli', 'https://images.unsplash.com/photo-1612548041144-af453bde331a?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('frietjes-stoofvlees', 'Frietjes met stoofvlees/vol-au-vent/steak', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Carbonade_flamande_2023.jpg/1280px-Carbonade_flamande_2023.jpg', 'vaste_gerechten'),
  ('wortels-pasta-pepersaus-worst', 'Wortels, pasta, pepersaus, worst', 'https://images.pexels.com/photos/16010637/pexels-photo-16010637.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('patapoefkes-fishsticks', 'Patapoefkes met fishsticks', 'https://images.pexels.com/photos/30882832/pexels-photo-30882832.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('pizza-diepvries', 'Pizza (diepvries)', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('curry-met-kip', 'Curry met kip', 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('aardappelgratin-prei', 'Aardappelgratin, prei, vlees/vis', 'https://images.pexels.com/photos/34985106/pexels-photo-34985106.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('ballekes-met-kriekskes', 'Ballekes met kriekskes', 'https://upload.wikimedia.org/wikipedia/commons/1/11/Ballekes_met_kriekskes_2.jpg', 'vaste_gerechten'),
  ('varkenssneetjes-patatten-bloemkool', 'Varkenssneetjes, patatten, bloemkool', 'https://images.pexels.com/photos/28996273/pexels-photo-28996273.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('koude-plat', 'Koude plat', 'https://images.pexels.com/photos/15419502/pexels-photo-15419502.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('vol-au-vent-pasta-erwten', 'Vol-au-vent met pasta, erwten', 'https://images.pexels.com/photos/33515064/pexels-photo-33515064.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('forestiere-ardeens-gebraad', 'Forestière, gebakken aardappelen, ardeens gebraad', 'https://images.pexels.com/photos/37047946/pexels-photo-37047946.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('hamburgers-frieten', 'Hamburgers, frieten, rauwe groenten', 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80', 'vaste_gerechten'),
  ('black-pepper-udon', 'Black pepper Udon noodles', 'https://images.pexels.com/photos/24246680/pexels-photo-24246680.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten'),
  ('hartige-balletjes-witloof', 'Hartige balletjes met witloof & puree (Jeroen Meus)', 'https://images.pexels.com/photos/20323448/pexels-photo-20323448.jpeg?auto=compress&cs=tinysrgb&w=1200', 'vaste_gerechten')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "imageUrl" = COALESCE(EXCLUDED."imageUrl", dishes."imageUrl"),
  category = EXCLUDED.category;

-- Note: Full ingredient data (pillars: basis, eiwit, groenten, saus, extra) is managed
-- by the app's mockDishes.ts and synced via the Supabase client. This migration only
-- ensures the dish records exist with their curated image URLs.