"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ShoppingCart } from "lucide-react";
import type { Dish, WeeklyMealPlan } from "@/types/dish";
import { deleteMealPlanEntry, getMealPlan, saveMealPlan } from "@/lib/supabase";
import { useApp } from "@/components/app/AppProvider";
import { DishDetailModal } from "@/components/dishes/DishDetailModal";
import { pillInset, sageButton } from "@/components/dishes/neo";
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

interface ModalState {
  date: string;
  dish: Dish;
  variations: string[];
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [shoppingOpen, setShoppingOpen] = useState(false);

  // Targets stay set while their dialog closes, so the exit animation does not go blank.
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const weekStart = startOfWeek(addDays(todayKey, weekOffset * 7));
  const days = getWeekDays(weekStart);
  const dishById = new Map(dishes.map((dish) => [dish.id, dish] as const));
  const entryByDate = new Map(plan.map((entry) => [entry.date, entry] as const));

  const slots: DaySlot[] = days.map((day) => {
    const entry = entryByDate.get(day.date);
    const dish = entry?.dishId ? dishById.get(entry.dishId) : undefined;
    return { ...day, dish, activeVariations: dish ? (entry?.activeVariations ?? []) : [] };
  });

  const weekEntries = days.flatMap((day) => entryByDate.get(day.date) ?? []);
  const departments = buildShoppingList(weekEntries, dishes);
  const itemCount = departments.reduce((total, department) => total + department.items.length, 0);
  const checkedKeys = new Set(checkedByWeek[weekStart] ?? []);

  const weekTitle = `Week ${isoWeekNumber(weekStart)}`;
  const weekRange = formatWeekRange(weekStart);

  /* Plan changes */

  const commitPlan = (next: WeeklyMealPlan[], removedDates: string[] = []) => {
    setPlan(next);
    saveMealPlan(next).catch(warn("[planner] Could not save the meal plan."));
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

  const clearDay = (date: string) => {
    commitPlan(
      plan.filter((entry) => entry.date !== date),
      [date],
    );
  };

  /** Moves a dish to another day. When that day already has a dish, the two swap. */
  const moveDish = (from: string, to: string) => {
    const source = entryByDate.get(from);
    if (!source?.dishId || from === to) return;
    const target = entryByDate.get(to);

    const next = plan.filter((entry) => entry.date !== from && entry.date !== to);
    next.push({ ...source, date: to, dayOfWeek: dayNameOf(to) });

    const removed: string[] = [];
    if (target?.dishId) {
      next.push({ ...target, date: from, dayOfWeek: dayNameOf(from) });
    } else {
      removed.push(from);
    }
    commitPlan(next, removed);
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
    setModal({ date: slot.date, dish: slot.dish, variations: slot.activeVariations });
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

  const pickerEntry = pickerDate ? entryByDate.get(pickerDate) : undefined;
  const pickerLabel = pickerDate ? `${dayNameOf(pickerDate)} ${formatShortDate(pickerDate)}` : "";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Weekmenu</h1>
          <p className="mt-1 text-muted-foreground" aria-live="polite">
            {weekTitle} · {weekRange} · {relativeWeekLabel(weekOffset)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <WeekNavigation weekOffset={weekOffset} onChange={setWeekOffset} />
          <button type="button" onClick={() => setShoppingOpen(true)} className={sageButton}>
            <ShoppingCart className="size-4" aria-hidden />
            Ingrediënten deze week (Colruyt Xtra)
            {itemCount > 0 && <span className={pillInset}>{itemCount}</span>}
          </button>
        </div>
      </header>

      <WeekView
        slots={slots}
        todayKey={todayKey}
        selectedDate={modalOpen ? (modal?.date ?? null) : null}
        editMode={editMode}
        onOpenDish={openDish}
        onPick={openPicker}
        onClear={clearDay}
        onMove={moveDish}
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
        weekLabel={`${weekTitle} · ${weekRange}`}
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
          upsertDish(dish);
          setModalOpen(false);
        }}
        onRequestDelete={(dish) => {
          setModalOpen(false);
          requestDelete(dish);
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