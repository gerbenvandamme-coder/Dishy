"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Clock, History as HistoryIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Dish, WeeklyMealPlan } from "@/types/dish";
import { cn } from "@/lib/utils";
import { DishImage } from "@/components/dishes/DishImage";
import { CollapsibleSearch, searchSiblingClass } from "@/components/dishes/CollapsibleSearch";
import {
  dishMatchesTerms,
  matchedIngredientNames,
  parseSearchTerms,
} from "@/components/dishes/dishSearch";
import { neoToggle } from "@/components/dishes/neo";
import { buildDishHistory, type DishHistory } from "@/components/calendar/dishHistory";
import {
  dayNameOf,
  formatShortDate,
  isoWeekNumber,
  weeksBetween,
} from "@/components/calendar/weekUtils";

const HISTORY_SURFACE =
  "rounded-2xl border-l-4 border-sage bg-(--tactile-bg) px-3 py-2.5 text-xs tactile-sunken";

interface HistoryCardProps {
  history: DishHistory | undefined;
  targetDate: string | null;
  onJump: (date: string) => void;
}

/** Shows when a dish was last planned, how often in the 4 weeks before, and the setup used last time. */
function DishHistoryCard({ history, targetDate, onJump }: HistoryCardProps) {
  if (!history) {
    return (
      <p className={cn(HISTORY_SURFACE, "flex items-center gap-1.5 text-muted-foreground")}>
        <HistoryIcon className="size-3.5 shrink-0" aria-hidden />
        Nog niet eerder gepland
      </p>
    );
  }

  const weeksAgo = targetDate ? weeksBetween(history.lastDate, targetDate) : 0;
  const when =
    weeksAgo <= 0
      ? "Eerder in dezelfde week"
      : `${weeksAgo} ${weeksAgo === 1 ? "week" : "weken"} eerder`;

  return (
    <div className={cn(HISTORY_SURFACE, "flex flex-col gap-2")}>
      <div className="flex items-start justify-between gap-2">
        <p className="flex min-w-0 items-start gap-1.5">
          <HistoryIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0">
            <span className="block font-semibold text-foreground">
              Laatst: {dayNameOf(history.lastDate)} {formatShortDate(history.lastDate)}
            </span>
            <span className="block text-muted-foreground">
              Week {isoWeekNumber(history.lastDate)} · {when}
            </span>
          </span>
        </p>
        <button
          type="button"
          onClick={() => onJump(history.lastDate)}
          className="-my-1 min-h-9 shrink-0 rounded-full px-2 font-medium text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring active:scale-95"
        >
          Bekijk week
        </button>
      </div>

      <p>
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 font-medium text-foreground">
          {history.recentCount}× in de laatste 4 weken
        </span>
      </p>

      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">Vorige keer:</span>{" "}
        {history.lastVariations.length > 0
          ? history.lastVariations.join(" · ")
          : "standaard, zonder variaties"}
      </p>
    </div>
  );
}

interface PickerBodyProps {
  dishes: Dish[];
  plan: WeeklyMealPlan[];
  targetDate: string | null;
  currentDishId?: string;
  onPick: (dish: Dish) => void;
  onJumpToWeek: (date: string) => void;
}

function PickerBody({
  dishes,
  plan,
  targetDate,
  currentDishId,
  onPick,
  onJumpToWeek,
}: PickerBodyProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const terms = useMemo(() => parseSearchTerms(query), [query]);
  const searching = terms.length > 0;
  const visible = useMemo(
    () => dishes.filter((dish) => dishMatchesTerms(dish, terms)),
    [dishes, terms],
  );
  const history = useMemo(
    () => (targetDate ? buildDishHistory(plan, targetDate) : new Map<string, DishHistory>()),
    [plan, targetDate],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {dishes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Je hebt nog geen gerechten.{" "}
          <Link href="/gerechten" className="font-medium text-foreground underline underline-offset-4">
            Voeg er een toe
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="flex h-11 shrink-0 items-center">
            <p
              className={cn(searchSiblingClass(searchOpen), "truncate text-sm text-muted-foreground")}
              aria-live="polite"
            >
              {searching ? `${visible.length} van ${dishes.length} gerechten` : `${dishes.length} gerechten`}
            </p>
            <CollapsibleSearch
              value={query}
              onChange={setQuery}
              label="Zoek op naam of ingrediënt"
              onExpandedChange={setSearchOpen}
              className="sm:w-auto sm:flex-1"
            />
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">Geen gerechten gevonden.</p>
          ) : (
            <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-1 [-webkit-overflow-scrolling:touch]">
              {visible.map((dish) => {
                const current = dish.id === currentDishId;
                const ingredientHits = searching ? matchedIngredientNames(dish, terms) : [];
                return (
                  <li key={dish.id} className="flex flex-col gap-2">
                    <button
                      type="button"
                      aria-pressed={current}
                      onClick={() => onPick(dish)}
                      className={cn(neoToggle(current, "sm"), "w-full justify-start gap-3 text-left")}
                    >
                      <DishImage src={dish.imageUrl} alt={dish.name} className="size-14 shrink-0" />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="line-clamp-2 text-sm font-semibold">{dish.name}</span>
                        {dish.prepTime && (
                          <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                            <Clock className="size-3" aria-hidden />
                            {dish.prepTime}
                          </span>
                        )}
                        {ingredientHits.length > 0 && (
                          <span className="line-clamp-1 text-xs font-normal text-muted-foreground">
                            Bevat: {ingredientHits.slice(0, 3).join(", ")}
                          </span>
                        )}
                      </span>
                      {current && <Check className="size-4 shrink-0" aria-hidden />}
                    </button>
                    {searching && (
                      <DishHistoryCard
                        history={history.get(dish.id)}
                        targetDate={targetDate}
                        onJump={onJumpToWeek}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

interface DishPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dishes: Dish[];
  /** The whole meal plan, used for the history cards. */
  plan: WeeklyMealPlan[];
  /** The day being planned, as a "YYYY-MM-DD" key. */
  targetDate: string | null;
  /** For example "Maandag 2 nov.". */
  dayLabel: string;
  currentDishId?: string;
  onPick: (dish: Dish) => void;
  /** Called with the date a dish was last planned, to show that week. */
  onJumpToWeek: (date: string) => void;
}

/** Slide-out drawer to choose the dish for a day. */
export function DishPickerSheet({
  open,
  onOpenChange,
  dishes,
  plan,
  targetDate,
  dayLabel,
  currentDishId,
  onPick,
  onJumpToWeek,
}: DishPickerSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-(--tactile-bg)">
        <SheetHeader className="px-5 pt-5 pr-14">
          <SheetTitle className="text-xl font-semibold tracking-tight">Kies een gerecht</SheetTitle>
          <SheetDescription>Voor {dayLabel}</SheetDescription>
        </SheetHeader>
        <PickerBody
          dishes={dishes}
          plan={plan}
          targetDate={targetDate}
          currentDishId={currentDishId}
          onPick={onPick}
          onJumpToWeek={onJumpToWeek}
        />
      </SheetContent>
    </Sheet>
  );
}