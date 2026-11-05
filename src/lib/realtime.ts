import type { Dish, WeeklyMealPlan } from "@/types/dish";
import { DISHES_TABLE, MEAL_PLAN_TABLE, supabase } from "@/lib/supabase";

export interface TableSyncHandlers<T> {
  /** A row was inserted or updated, by this session or by another one. */
  onUpsert: (row: T) => void;
  /** A row was deleted. Receives the value of the primary key column. */
  onDelete: (key: string) => void;
  /** The connection came back after a drop, so events may have been missed. Reload the table. */
  onResync: () => void;
}

/** Each subscription gets its own channel name, so React strict mode can mount, unmount and mount again safely. */
let channelCounter = 0;

/** The database returns null for empty columns, the app types use undefined. */
function withoutNulls(raw: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== null));
}

/**
 * Listens to INSERT, UPDATE and DELETE on one table.
 * Returns a function that removes the channel. Without Supabase it does nothing.
 */
function subscribeToTable<T>(
  table: string,
  keyColumn: string,
  handlers: TableSyncHandlers<T>,
): () => void {
  const client = supabase;
  if (!client) return () => {};

  let hasConnected = false;
  channelCounter += 1;

  const channel = client
    .channel(`${table}-sync-${channelCounter}`)
    .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
      if (payload.eventType === "DELETE") {
        const key: unknown = payload.old[keyColumn];
        if (typeof key === "string") handlers.onDelete(key);
        return;
      }
      handlers.onUpsert(withoutNulls(payload.new) as T);
    })
    .subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      // The first SUBSCRIBED follows the initial load. Later ones follow a reconnect.
      if (hasConnected) handlers.onResync();
      hasConnected = true;
    });

  return () => {
    void client.removeChannel(channel);
  };
}

/** Live changes to the shared dish library. */
export function subscribeToDishes(handlers: TableSyncHandlers<Dish>): () => void {
  return subscribeToTable<Dish>(DISHES_TABLE, "id", handlers);
}

/** Live changes to the shared weekly meal plan. The primary key is the ISO date. */
export function subscribeToMealPlan(handlers: TableSyncHandlers<WeeklyMealPlan>): () => void {
  return subscribeToTable<WeeklyMealPlan>(MEAL_PLAN_TABLE, "date", handlers);
}