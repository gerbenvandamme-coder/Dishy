import type { Dish } from "@/types/dish";

/**
 * A dish composed in the configurator that still needs a day on the weekmenu.
 * It travels to the weekplanner in sessionStorage, which survives the client-side navigation
 * and a refresh of the tab, but not a new tab or session.
 */
const KEY = "dishy:pending-assignment";

export function setPendingAssignment(dish: Dish): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(dish));
  } catch (error) {
    console.warn("[assignment] Could not keep the dish for the planner.", error);
  }
}

export function readPendingAssignment(): Dish | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Dish).id === "string" &&
      typeof (parsed as Dish).name === "string" &&
      Array.isArray((parsed as Dish).ingredients)
    ) {
      return parsed as Dish;
    }
  } catch {
    // Unreadable or blocked storage: behave as if nothing is pending.
  }
  return null;
}

export function clearPendingAssignment(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clean up when storage is blocked.
  }
}
