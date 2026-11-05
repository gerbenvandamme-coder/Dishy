import type { WeeklyMealPlan } from "@/types/dish";
import { addDays } from "@/components/calendar/weekUtils";

/** How far back the frequency count looks, in days (4 weeks). */
const FREQUENCY_WINDOW_DAYS = 28;

export interface DishHistory {
  /** Most recent day before the target day on which the dish was planned. */
  lastDate: string;
  /** Variations that were active on that day. */
  lastVariations: string[];
  /** Times the dish was planned in the 28 days before the target day. */
  recentCount: number;
}

/** Summarizes, per dish, when it was last planned before `beforeDate` and how often in the 4 weeks before it. */
export function buildDishHistory(
  plan: readonly WeeklyMealPlan[],
  beforeDate: string,
): Map<string, DishHistory> {
  const windowStart = addDays(beforeDate, -FREQUENCY_WINDOW_DAYS);
  const history = new Map<string, DishHistory>();

  for (const entry of plan) {
    if (!entry.dishId || entry.date >= beforeDate) continue;

    const inWindow = entry.date >= windowStart ? 1 : 0;
    const existing = history.get(entry.dishId);

    if (!existing) {
      history.set(entry.dishId, {
        lastDate: entry.date,
        lastVariations: entry.activeVariations ?? [],
        recentCount: inWindow,
      });
      continue;
    }

    existing.recentCount += inWindow;
    if (entry.date > existing.lastDate) {
      existing.lastDate = entry.date;
      existing.lastVariations = entry.activeVariations ?? [];
    }
  }

  return history;
}