"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { Dish, IngredientGroup, WeeklyMealPlan } from "@/types/dish";
import { getMealPlan, saveMealPlan } from "@/lib/supabase";
import { useApp } from "@/components/app/AppProvider";
import {
  dayNameOf,
  formatShortDate,
  fromDateKey,
  toDateKey,
} from "@/components/calendar/weekUtils";
import {
  EMPTY_DRAFT,
  addItem,
  countItems,
  suggestDishName,
  toggleItem,
  type Draft,
} from "@/components/configurator/draft";
import { TemplateWizard } from "@/components/configurator/TemplateWizard";
import { CustomDishBuilder } from "@/components/configurator/CustomDishBuilder";
import { SaveDishPanel } from "@/components/configurator/SaveDishPanel";
import { useCustomIngredients } from "@/components/configurator/useCustomIngredients";
import { DayPickerDialog } from "@/components/configurator/DayPickerDialog";

/** Where the user lands after saving a dish. */
const AFTER_SAVE_PATH = "/gerechten";

/* The URL only exists in the browser. The server snapshot is empty, so the
   static HTML never contains them and hydration cannot mismatch. */
const subscribeNoop = () => () => {};
const getSearch = (): string => window.location.search;
const getServerValue = (): string => "";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date such as "2026-11-18". */
function isValidDateKey(key: string): boolean {
  return DATE_KEY_PATTERN.test(key) && toDateKey(fromDateKey(key)) === key;
}

function describeDay(key: string): string {
  return isValidDateKey(key) ? `${dayNameOf(key)} ${formatShortDate(key)}` : "";
}

/**
 * Owns the dish being composed. The template wizard and the free-form builder both
 * write to the same draft, and the save panel turns it into a library dish.
 */
export function ConfiguratorWorkspace() {
  const router = useRouter();
  const { dishes, upsertDish, editMode } = useApp();
  const customIngredients = useCustomIngredients();

  // "?dag=YYYY-MM-DD" is set by the weekplanner when the user wants a one-off dish for that day.
  const search = useSyncExternalStore(subscribeNoop, getSearch, getServerValue);
  const dayParam = new URLSearchParams(search).get("dag") ?? "";
  const fromPlanner = isValidDateKey(dayParam);
  // Without a day from the planner, the user picks the day in the planner's assign mode.
  const weekDate = fromPlanner ? dayParam : "";
  const [plan, setPlan] = useState<WeeklyMealPlan[]>([]);
  const [addingToWeek, setAddingToWeek] = useState(false);
  // Without a day from the planner, the dish waits here while the user picks a day in the small window.
  const [pendingDish, setPendingDish] = useState<Dish | null>(null);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [placedLabel, setPlacedLabel] = useState("");

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [customName, setCustomName] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState("");
  const [scrollToken, setScrollToken] = useState(0);
  const saveSectionRef = useRef<HTMLElement | null>(null);

  const autoName = suggestDishName(draft);
  const name = customName ?? autoName;

  // After a template is applied, bring the finished dish into view.
  useEffect(() => {
    if (scrollToken === 0) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = saveSectionRef.current;
    if (!section) return;
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    section.focus({ preventScroll: true });
  }, [scrollToken]);

  const handleApplyTemplate = (next: Draft) => {
    setDraft(next);
    setCustomName(null);
    setScrollToken((previous) => previous + 1);
  };

  const handleToggle = (group: IngredientGroup, item: string) =>
    setDraft((previous) => toggleItem(previous, group, item));

  const handleAdd = (group: IngredientGroup, item: string) =>
    setDraft((previous) => addItem(previous, group, item));

  const handleClear = () => {
    setDraft(EMPTY_DRAFT);
    setCustomName(null);
  };

  const handleSave = (dish: Dish) => {
    upsertDish(dish);
    router.push(AFTER_SAVE_PATH);
  };

  // The plan is only read to warn about a day that already has a dish.
  useEffect(() => {
    let cancelled = false;
    getMealPlan()
      .then((loaded) => {
        if (!cancelled) setPlan(loaded);
      })
      .catch((error: unknown) => {
        console.warn("[configurator] Could not load the meal plan.", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const plannedEntry = plan.find((entry) => entry.date === weekDate);
  const replacesDishName =
    plannedEntry?.oneOffDish?.name ??
    (plannedEntry?.dishId ? dishes?.find((dish) => dish.id === plannedEntry.dishId)?.name : undefined);

  /** Stores the dish as a one-off dish on `date`. It goes in the plan, never in the library. */
  const placeOneOff = (dish: Dish, date: string): Promise<WeeklyMealPlan[]> =>
    getMealPlan()
      .catch((error: unknown) => {
        console.warn("[configurator] Could not load the meal plan.", error);
        return [] as WeeklyMealPlan[];
      })
      .then(async (latest) => {
        const entry: WeeklyMealPlan = {
          date,
          dayOfWeek: dayNameOf(date),
          oneOffDish: dish,
          activeVariations: [],
        };
        const next = latest.some((existing) => existing.date === date)
          ? latest.map((existing) => (existing.date === date ? entry : existing))
          : [...latest, entry];
        await saveMealPlan(next, [entry]);
        return next;
      });

  /**
   * Coming from a day in the planner, the dish goes straight to that day and the planner opens again.
   * Otherwise a small window asks for the day and the user stays in the configurator.
   */
  const handleAddToWeek = (dish: Dish) => {
    if (!isValidDateKey(weekDate)) {
      setPlacedLabel("");
      setPendingDish(dish);
      return;
    }
    const date = weekDate;
    setAddingToWeek(true);
    placeOneOff(dish, date)
      .then(() => router.push(`/?week=${date}`))
      .catch((error: unknown) => {
        console.warn("[configurator] Could not add the dish to the week.", error);
        setAddingToWeek(false);
      });
  };

  const handlePickDay = (date: string) => {
    if (!pendingDish) return;
    setSavingDate(date);
    placeOneOff(pendingDish, date)
      .then((next) => {
        setPlan(next);
        setPlacedLabel(`${pendingDish.name} staat op ${describeDay(date).toLowerCase()}.`);
        setPendingDish(null);
      })
      .catch((error: unknown) => {
        console.warn("[configurator] Could not add the dish to the week.", error);
      })
      .finally(() => setSavingDate(null));
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-8 pb-32 sm:px-6 sm:pt-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl leading-tight font-black tracking-tight sm:text-4xl">
          Stel een gerecht samen
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Start met een template of kies zelf je ingrediënten. Bewaar het resultaat in je
          bibliotheek, of zet het eenmalig op het weekmenu.
        </p>
        {fromPlanner && (
          <p
            role="status"
            className="rounded-2xl border border-sage-border bg-sage-tint px-4 py-3 text-sm font-medium text-foreground"
          >
            Je stelt een eenmalig gerecht samen voor <strong>{describeDay(dayParam)}</strong>. Het
            komt niet in je bibliotheek, tenzij je dat zelf kiest.
          </p>
        )}
      </header>

      <TemplateWizard hasExistingDraft={countItems(draft) > 0} onApply={handleApplyTemplate} />

      <CustomDishBuilder
        draft={draft}
        customItems={customIngredients.items}
        hiddenItems={customIngredients.hidden}
        editMode={editMode}
        onToggle={handleToggle}
        onAdd={handleAdd}
        onAddCustom={customIngredients.add}
        onHideBuiltIn={customIngredients.hide}
        onRemoveCustom={customIngredients.remove}
      />

      <SaveDishPanel
        sectionRef={saveSectionRef}
        draft={draft}
        name={name}
        nameIsCustom={customName !== null}
        prepTime={prepTime}
        ready={dishes !== null}
        weekDateLabel={describeDay(weekDate)}
        replacesDishName={replacesDishName}
        fromPlanner={fromPlanner}
        addingToWeek={addingToWeek}
        placedLabel={placedLabel}
        onNameChange={setCustomName}
        onResetName={() => setCustomName(null)}
        onPrepTimeChange={setPrepTime}
        onClear={handleClear}
        onSave={handleSave}
        onAddToWeek={handleAddToWeek}
      />

      {/* Mounted only when needed: it reads today's date, which must not run while prerendering. */}
      {pendingDish && (
        <DayPickerDialog
          open
          onOpenChange={(open) => {
            if (!open && savingDate === null) setPendingDish(null);
          }}
          dishName={pendingDish?.name ?? ""}
          plan={plan}
          dishes={dishes}
          savingDate={savingDate}
          onPick={handlePickDay}
        />
      )}
    </div>
  );
}
