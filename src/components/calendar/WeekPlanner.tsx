"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeftRight, CalendarPlus, ShoppingCart } from "lucide-react";
import type { Dish, WeeklyMealPlan } from "@/types/dish";
import { deleteMealPlanEntry, getMealPlan, saveMealPlan } from "@/lib/supabase";
import { subscribeToMealPlan } from "@/lib/realtime";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/app/AppProvider";
import { DishDetailModal } from "@/components/dishes/DishDetailModal";
import { neoToggle, pillInset, sageButton } from "@/components/dishes/neo";
import { ModeBar } from "@/components/calendar/ModeBar";
import {
  clearPendingAssignment,
  readPendingAssignment,
} from "@/lib/pendingAssignment";
import { ColruytSheet } from "@/components/calendar/ColruytSheet";
import { DishPickerSheet } from "@/components/calendar/DishPickerSheet";
import { WeekNavigation } from "@/components/calendar/WeekNavigation";
import { WeekView, type DaySlot } from "@/components/calendar/WeekView";
import {
  buildShoppingList,
  loadChecked,
  saveChecked,
  type CheckedByWeek,
} from "@/components/calendar/colruytList";
import {
  addDays,
  dayNameOf,
  formatShortDate,
  formatWeekRange,
  getWeekDays,
  isoWeekNumber,
  relativeWeekLabel,
  startOfWeek,
  toDateKey,
  weeksBetween,
} from "@/components/calendar/weekUtils";

/* Today's date only exists in the browser: the server snapshot is null, so the
   static HTML never contains a date and hydration cannot mismatch. */
const subscribeNoop = () => () => {};
const getTodayKey = (): string | null => toDateKey(new Date());
const getServerTodayKey = (): string | null => null;

function warn(message: string) {
  return (error: unknown) => console.warn(message, error);
}

function upsertEntry(plan: WeeklyMealPlan[], entry: WeeklyMealPlan): WeeklyMealPlan[] {
  return plan.some((existing) => existing.date === entry.date)
    ? plan.map((existing) => (existing.date === entry.date ? entry : existing))
    : [...plan, entry];
}

/** A day has a dish when it holds a library dish or a one-off dish. */
function hasDish(entry: WeeklyMealPlan | undefined): entry is WeeklyMealPlan {
  return entry !== undefined && Boolean(entry.dishId || entry.oneOffDish);
}

const WEEK_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** The week to show first: "?week=YYYY-MM-DD" (set after adding a one-off dish), otherwise this week. */
function initialWeekOffset(todayKey: string): number {
  const week = new URLSearchParams(window.location.search).get("week");
  return week !== null && WEEK_PARAM_PATTERN.test(week) ? weeksBetween(todayKey, week) : 0;
}

/** The configurator sends "?toewijzen=1": a dish waits for a day, so the planner opens in assign mode. */
function initialAssignment(): Dish | null {
  const flag = new URLSearchParams(window.location.search).get("toewijzen");
  return flag === "1" ? readPendingAssignment() : null;
}

interface ModalState {
  date: string;
  dish: Dish;
  variations: string[];
  /** The dish belongs to this day only, so saving must not touch the library. */
  oneOff: boolean;
}

interface PlannerBoardProps {
  todayKey: string;
  dishes: Dish[];
  initialPlan: WeeklyMealPlan[];
  initialChecked: CheckedByWeek;
}

function PlannerBoard({ todayKey, dishes, initialPlan, initialChecked }: PlannerBoardProps) {
  const { editMode, upsertDish, requestDelete } = useApp();

  const [plan, setPlan] = useState(initialPlan);
  const [checkedByWeek, setCheckedByWeek] = useState(initialChecked);
  const [weekOffset, setWeekOffset] = useState(() => initialWeekOffset(todayKey));
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [swapSource, setSwapSource] = useState<string | null>(null);
  const [pendingDish, setPendingDish] = useState<Dish | null>(initialAssignment);

  // Targets stay set while their dialog closes, so the exit animation does not go blank.
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Changes from other family members. Our own writes echo back and replace the entry with the same data.
  useEffect(() => {
    return subscribeToMealPlan({
      onUpsert: (entry) => setPlan((previous) => upsertEntry(previous, entry)),
      onDelete: (date) => setPlan((previous) => previous.filter((entry) => entry.date !== date)),
      onResync: () => {
        getMealPlan().then(setPlan).catch(warn("[planner] Could not refresh the meal plan."));
      },
    });
  }, []);

  const finishAssign = () => {
    setPendingDish(null);
    clearPendingAssignment();
    window.history.replaceState(null, "", window.location.pathname);
  };

  const inMode = swapMode || pendingDish !== null;

  useEffect(() => {
    if (!inMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSwapMode(false);
      setSwapSource(null);
      setPendingDish(null);
      clearPendingAssignment();
      window.history.replaceState(null, "", window.location.pathname);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inMode]);

  const weekStart = startOfWeek(addDays(todayKey, weekOffset * 7));
  const days = getWeekDays(weekStart);
  const dishById = new Map(dishes.map((dish) => [dish.id, dish] as const));
  const entryByDate = new Map(plan.map((entry) => [entry.date, entry] as const));

  const slots: DaySlot[] = days.map((day) => {
    const entry = entryByDate.get(day.date);
    const dish = entry?.oneOffDish ?? (entry?.dishId ? dishById.get(entry.dishId) : undefined);
    return {
      ...day,
      dish,
      isOneOff: Boolean(entry?.oneOffDish),
      activeVariations: dish ? (entry?.activeVariations ?? []) : [],
    };
  });

  const weekEntries = days.flatMap((day) => entryByDate.get(day.date) ?? []);
  const departments = buildShoppingList(weekEntries, dishes);
  const itemCount = departments.reduce((total, department) => total + department.items.length, 0);
  const checkedKeys = new Set(checkedByWeek[weekStart] ?? []);

  const weekTitle = `Week ${isoWeekNumber(weekStart)}`;
  const weekRange = formatWeekRange(weekStart);

  /* Plan changes */

  const isUnchanged = (entry: WeeklyMealPlan) => {
    const before = entryByDate.get(entry.date);
    return (
      before !== undefined &&
      before.dayOfWeek === entry.dayOfWeek &&
      before.dishId === entry.dishId &&
      JSON.stringify(before.oneOffDish ?? null) === JSON.stringify(entry.oneOffDish ?? null) &&
      before.customNotes === entry.customNotes &&
      (before.activeVariations ?? []).join("\u0000") === (entry.activeVariations ?? []).join("\u0000")
    );
  };

  const commitPlan = (next: WeeklyMealPlan[], removedDates: string[] = []) => {
    setPlan(next);
    // Only the changed days are written, so a stale local plan never overwrites another member's days.
    saveMealPlan(next, next.filter((entry) => !isUnchanged(entry))).catch(
      warn("[planner] Could not save the meal plan."),
    );
    removedDates.forEach((date) => {
      deleteMealPlanEntry(date).catch(warn("[planner] Could not delete the meal plan entry."));
    });
  };

  const assignDish = (dish: Dish) => {
    if (!pickerDate) return;
    commitPlan(
      upsertEntry(plan, {
        date: pickerDate,
        dayOfWeek: dayNameOf(pickerDate),
        dishId: dish.id,
        activeVariations: [],
      }),
    );
    setPickerOpen(false);
  };

  /** Assign mode: puts the dish from the configurator on the tapped day, as a one-off dish. */
  const assignToDay = (date: string) => {
    if (!pendingDish) return;
    commitPlan(
      upsertEntry(plan, {
        date,
        dayOfWeek: dayNameOf(date),
        oneOffDish: pendingDish,
        activeVariations: [],
      }),
    );
    finishAssign();
  };

  const clearDay = (date: string) => {
    commitPlan(
      plan.filter((entry) => entry.date !== date),
      [date],
    );
  };

  /** Moves a dish to another day. When that day already has a dish, the two swap. */
  const moveDish = (from: string, to: string) => {
    const source = entryByDate.get(from);
    if (!hasDish(source) || from === to) return;
    const target = entryByDate.get(to);

    const next = plan.filter((entry) => entry.date !== from && entry.date !== to);
    next.push({ ...source, date: to, dayOfWeek: dayNameOf(to) });

    const removed: string[] = [];
    if (hasDish(target)) {
      next.push({ ...target, date: from, dayOfWeek: dayNameOf(from) });
    } else {
      removed.push(from);
    }
    commitPlan(next, removed);
  };

  /** Swap mode: the first tap picks a dish up, the next tap on another day puts it down or swaps. */
  const handleSwapSelect = (date: string) => {
    if (swapSource === null) {
      if (hasDish(entryByDate.get(date))) setSwapSource(date);
      return;
    }
    if (swapSource === date) {
      setSwapSource(null);
      return;
    }
    moveDish(swapSource, date);
    setSwapSource(null);
  };

  const toggleSwapMode = () => {
    setSwapMode((previous) => !previous);
    setSwapSource(null);
  };

  const setVariations = (date: string, variations: string[]) => {
    const entry = entryByDate.get(date);
    if (!entry) return;
    commitPlan(upsertEntry(plan, { ...entry, activeVariations: variations }));
  };

  /* Dialogs */

  const openPicker = (date: string) => {
    setPickerDate(date);
    setPickerOpen(true);
  };

  const openDish = (slot: DaySlot) => {
    if (!slot.dish) return;
    setModal({
      date: slot.date,
      dish: slot.dish,
      variations: slot.activeVariations,
      oneOff: slot.isOneOff,
    });
    setModalOpen(true);
  };

  /* Shopping list */

  const toggleChecked = (key: string) => {
    const current = checkedByWeek[weekStart] ?? [];
    const updated = current.includes(key)
      ? current.filter((existing) => existing !== key)
      : [...current, key];
    const next = { ...checkedByWeek, [weekStart]: updated };
    setCheckedByWeek(next);
    saveChecked(next);
  };

  const resetChecked = () => {
    const next = { ...checkedByWeek };
    delete next[weekStart];
    setCheckedByWeek(next);
    saveChecked(next);
  };

  /** Shows the week in which a dish was last planned and closes the picker. */
  const jumpToWeek = (date: string) => {
    setWeekOffset(weeksBetween(todayKey, date));
    setPickerOpen(false);
  };

  const sourceEntry = swapSource ? entryByDate.get(swapSource) : undefined;
  const sourceDish = sourceEntry?.oneOffDish ?? (sourceEntry?.dishId ? dishById.get(sourceEntry.dishId) : undefined);
  const sourceLabel = swapSource ? `${dayNameOf(swapSource)} ${formatShortDate(swapSource)}` : "";

  const pickerEntry = pickerDate ? entryByDate.get(pickerDate) : undefined;
  const pickerLabel = pickerDate ? `${dayNameOf(pickerDate)} ${formatShortDate(pickerDate)}` : "";

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:py-12",
        inMode && "pb-36",
      )}
    >
      <header className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <p className="text-sm font-bold tracking-wide text-sage-ink uppercase" aria-live="polite">
              {relativeWeekLabel(weekOffset)}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{weekTitle}</h1>
            <p className="mt-1 text-muted-foreground">{weekRange}</p>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <button
              type="button"
              aria-pressed={swapMode}
              disabled={pendingDish !== null}
              onClick={toggleSwapMode}
              className={cn(neoToggle(swapMode), "justify-center")}
            >
              <ArrowLeftRight className="size-4" aria-hidden />
              Omwisselen
            </button>
            <button type="button" onClick={() => setShoppingOpen(true)} className={sageButton}>
              <ShoppingCart className="size-4 shrink-0 max-[400px]:hidden" aria-hidden />
              Boodschappen<span className="max-sm:sr-only"> {weekTitle.toLowerCase()}</span>
              {itemCount > 0 && <span className={pillInset}>{itemCount}</span>}
            </button>
          </div>
        </div>

        <WeekNavigation weekOffset={weekOffset} onChange={setWeekOffset} />
      </header>

      {pendingDish && (
        <ModeBar Icon={CalendarPlus} title="Toewijzingsmodus" exitLabel="Annuleren" onExit={finishAssign}>
          Tik op de dag voor <strong>{pendingDish.name}</strong>.
          <span className="max-sm:hidden">
            {" "}Staat daar al een gerecht, dan wordt het vervangen. Je kan ook naar een andere week
            bladeren.
          </span>
        </ModeBar>
      )}

      {swapMode && (
        <ModeBar Icon={ArrowLeftRight} title="Omwisselmodus" exitLabel="Klaar" onExit={toggleSwapMode}>
          {swapSource === null ? (
            "Tik op het gerecht dat je wilt verplaatsen."
          ) : (
            <>
              <strong>
                {sourceLabel}
                {sourceDish ? `: ${sourceDish.name}` : ""}
              </strong>{" "}
              gekozen. Tik op een andere dag
              <span className="max-sm:hidden">. Staat daar al een gerecht, dan wisselen ze om</span>.
            </>
          )}
        </ModeBar>
      )}

      <WeekView
        slots={slots}
        todayKey={todayKey}
        selectedDate={modalOpen ? (modal?.date ?? null) : null}
        editMode={editMode}
        swapMode={swapMode}
        swapSource={swapSource}
        assignDish={pendingDish}
        onAssign={assignToDay}
        onOpenDish={openDish}
        onPick={openPicker}
        onClear={clearDay}
        onMove={moveDish}
        onSwapSelect={handleSwapSelect}
      />

      <DishPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        dishes={dishes}
        plan={plan}
        targetDate={pickerDate}
        dayLabel={pickerLabel}
        currentDishId={pickerEntry?.dishId}
        onPick={assignDish}
        onJumpToWeek={jumpToWeek}
      />

      <ColruytSheet
        open={shoppingOpen}
        onOpenChange={setShoppingOpen}
        weekTitle={weekTitle}
        weekRange={weekRange}
        weekRelative={relativeWeekLabel(weekOffset)}
        onWeekChange={(step) => setWeekOffset((previous) => previous + step)}
        departments={departments}
        checked={checkedKeys}
        onToggle={toggleChecked}
        onReset={resetChecked}
      />

      <DishDetailModal
        dish={modal?.dish ?? null}
        open={modalOpen}
        editMode={editMode}
        isNew={false}
        activeVariations={modal?.variations}
        onActiveVariationsChange={(variations) => {
          if (modal) setVariations(modal.date, variations);
        }}
        onOpenChange={setModalOpen}
        onSave={(dish) => {
          if (modal?.oneOff) {
            // A one-off dish is edited in the plan only, never written to the library.
            const entry = entryByDate.get(modal.date);
            if (entry) commitPlan(upsertEntry(plan, { ...entry, oneOffDish: dish }));
          } else {
            upsertDish(dish);
          }
          setModalOpen(false);
        }}
        onRequestDelete={(dish) => {
          setModalOpen(false);
          if (modal?.oneOff) clearDay(modal.date);
          else requestDelete(dish);
        }}
      />
    </div>
  );
}

/** Loads the meal plan and the dishes, then shows the weekly planner. */
export function WeekPlanner() {
  const { dishes } = useApp();
  const todayKey = useSyncExternalStore<string | null>(subscribeNoop, getTodayKey, getServerTodayKey);
  const [loaded, setLoaded] = useState<{ plan: WeeklyMealPlan[]; checked: CheckedByWeek } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    getMealPlan()
      .catch((error: unknown) => {
        console.warn("[planner] Could not load the meal plan.", error);
        return [] as WeeklyMealPlan[];
      })
      .then((plan) => {
        if (!cancelled) setLoaded({ plan, checked: loadChecked() });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (todayKey === null || dishes === null || loaded === null) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Weekmenu</h1>
          <p className="mt-1 text-muted-foreground" aria-live="polite">
            Weekmenu laden…
          </p>
        </div>
        <ul aria-busy="true" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <li
              key={index}
              className="h-48 animate-pulse rounded-3xl bg-(--tactile-bg) tactile-sunken motion-reduce:animate-none"
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <PlannerBoard
      todayKey={todayKey}
      dishes={dishes}
      initialPlan={loaded.plan}
      initialChecked={loaded.checked}
    />
  );
}