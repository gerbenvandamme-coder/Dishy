import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { mockDishes } from "../src/lib/mockDishes";

loadEnv({ path: ".env.local" });

const DISHES_TABLE = "dishes";

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);

  // ignoreDuplicates keeps rows that already exist, so edits people made in the app are not overwritten.
  const { data, error } = await supabase
    .from(DISHES_TABLE)
    .upsert(mockDishes, { onConflict: "id", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }

  const inserted = data?.length ?? 0;
  console.log(
    `Inserted ${inserted} new dishes. ${mockDishes.length - inserted} already existed and were left unchanged.`,
  );
}

main().catch((err: unknown) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});