"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Dish, WeeklyMealPlan } from "@/types/dish";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { dialogSurface, neoIconButton } from "@/components/dishes/neo";
import {
  addDays,
  formatShortDate,
  getWeekDays,
  relativeWeekLabel,
  startOfWeek,
  toDateKey,
} from "@/components/calendar/weekUtils";

interface DayPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Name of the dish that will be placed, shown in the title. */
  dishName: string;
  plan: readonly WeeklyMealPlan[];
  dishes: readonly Dish[] | null;
  /** The date being saved right now, so its row shows a spinner. */
  savingDate: string | null;
  onPick: (date: string) => void;
}

/** What is already planned on a day, or an empty string. */
function plannedName(entry: WeeklyMealPlan | undefined, dishes: readonly Dish[] | null): string {
  if (!entry) return "";
  if (entry.oneOffDish) return entry.oneOffDish.name;
  if (entry.dishId) return dishes?.find((dish) => dish.id === entry.dishId)?.name ?? "Gerecht";
  return "";
}

/**
 * A small window with the seven days of one week. Each row shows briefly what is already planned,
 * and a tap puts the one-off dish on that day. Past days cannot be picked.
 */
export function DayPickerDialog({
  open,
  onOpenChange,
  dishName,
  plan,
  dishes,
  savingDate,
  onPick,
}: DayPickerDialogProps) {
  const today = toDateKey(new Date());
  const [offset, setOffset] = useState(0);
  const weekStart = addDays(startOfWeek(today), offset * 7);
  const days = getWeekDays(weekStart);
  const busy = savingDate !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setOffset(0);
        onOpenChange(next);
      }}
    >
      <DialogContent className={cn(dialogSurface, "max-w-[min(20rem,calc(100%-2rem))] gap-3 p-4 sm:max-w-xs sm:p-5")}>
        <div className="pr-12">
          <DialogTitle className="font-display text-base font-extrabold tracking-tight">
            Op welke dag?
          </DialogTitle>
          <DialogDescription className="truncate text-xs">{dishName}, eenmalig</DialogDescription>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="Vorige week"
            disabled={offset <= 0 || busy}
            onClick={() => setOffset((value) => value - 1)}
            className={cn(neoIconButton, "size-8 pointer-coarse:size-10")}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <p className="text-sm font-semibold">{relativeWeekLabel(offset)}</p>
          <button
            type="button"
            aria-label="Volgende week"
            disabled={offset >= 8 || busy}
            onClick={() => setOffset((value) => value + 1)}
            className={cn(neoIconButton, "size-8 pointer-coarse:size-10")}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        <ul className="flex flex-col gap-1">
          {days.map(({ date, dayOfWeek }) => {
            const past = date < today;
            const planned = plannedName(
              plan.find((entry) => entry.date === date),
              dishes,
            );
            return (
              <li key={date}>
                <button
                  type="button"
                  disabled={past || busy}
                  onClick={() => onPick(date)}
                  className={cn(
                    "flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1 text-left transition-colors hover:bg-sage-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                    date === today && "ring-1 ring-sage/60",
                  )}
                >
                  <span className="w-[4.5rem] shrink-0 text-sm font-semibold whitespace-nowrap">
                    {dayOfWeek.slice(0, 2)} {formatShortDate(date).replace(".", "")}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-xs",
                      planned ? "text-muted-foreground" : "text-muted-foreground/60 italic",
                    )}
                  >
                    {planned || "nog leeg"}
                  </span>
                  {savingDate === date && <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
