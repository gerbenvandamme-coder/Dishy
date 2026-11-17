"use client";

import { useEffect, useId, useState, type FormEvent, type RefObject } from "react";
import { CalendarPlus, Library, Loader2, RotateCcw } from "lucide-react";
import type { Dish } from "@/types/dish";
import { cn } from "@/lib/utils";
import { neoButton, neoWell, pillarPill } from "@/components/dishes/neo";
import { DETAIL_PILLARS, createId, normalizeName } from "@/components/dishes/dishHelpers";
import { countItems, draftToIngredients, type Draft } from "@/components/configurator/draft";
import { primaryButton } from "@/components/configurator/styles";

interface SaveDishPanelProps {
  sectionRef: RefObject<HTMLElement | null>;
  draft: Draft;
  name: string;
  /** True when the user typed their own title instead of the generated one. */
  nameIsCustom: boolean;
  prepTime: string;
  /** False while the dish library is still loading, because saving needs it. */
  ready: boolean;
  /** For example "Woensdag 18 nov.". Only set when the planner already picked the day. Otherwise the user picks it in the planner. */
  weekDateLabel: string;
  /** Name of the dish that is already planned on that day and would be replaced. */
  replacesDishName?: string;
  /** The user came from a day in the weekplanner, so adding to the week is the main action and the day is known. */
  fromPlanner: boolean;
  /** True while the dish is being put on the weekmenu. */
  addingToWeek: boolean;
  /** Confirmation after a one-off dish was placed from the day picker. */
  placedLabel: string;
  onNameChange: (name: string) => void;
  onResetName: () => void;
  onPrepTimeChange: (prepTime: string) => void;
  onClear: () => void;
  /** Saves the dish in the library. */
  onSave: (dish: Dish) => void;
  /** Puts the dish on the weekmenu. The library stays untouched. */
  onAddToWeek: (dish: Dish) => void;
}

/** Summary of the composed dish, an editable title, and the two ways to keep it. */
export function SaveDishPanel({
  sectionRef,
  draft,
  name,
  nameIsCustom,
  prepTime,
  ready,
  weekDateLabel,
  replacesDishName,
  fromPlanner,
  addingToWeek,
  placedLabel,
  onNameChange,
  onResetName,
  onPrepTimeChange,
  onClear,
  onSave,
  onAddToWeek,
}: SaveDishPanelProps) {
  const hintId = useId();
  const selectedCount = countItems(draft);
  const hasName = normalizeName(name).length > 0;
  const hasDraft = selectedCount > 0 && hasName;
  const canSave = ready && hasDraft;
  const canAddToWeek = hasDraft && !addingToWeek;

  let blockedReason = "";
  if (selectedCount === 0) blockedReason = "Kies eerst minstens één ingrediënt.";
  else if (!hasName) blockedReason = "Geef het gerecht een naam.";
  else if (!ready) blockedReason = "De bibliotheek wordt nog geladen.";

  const summary = DETAIL_PILLARS.filter((pillar) => draft[pillar.group].length > 0);

  const buildDish = (idPrefix: string): Dish => ({
    id: createId(idPrefix),
    name: normalizeName(name),
    prepTime: normalizeName(prepTime) || undefined,
    category: "geconfigureerd",
    ingredients: draftToIngredients(draft),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    onSave(buildDish("dish"));
  };

  const handleAddToWeek = () => {
    if (!canAddToWeek) return;
    onAddToWeek(buildDish("eenmalig"));
  };

  // The save section scrolls out of view on a phone, so its two actions also live in a bar at the bottom.
  const [sectionVisible, setSectionVisible] = useState(true);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setSectionVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef]);
  const showQuickBar = hasDraft && !sectionVisible;

  const weekBlock = (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl p-4 tactile-sunken",
        fromPlanner && "order-first ring-2 ring-sage/60",
      )}
    >
      <div>
        <h3 className="font-display text-base font-extrabold">Eenmalig op het weekmenu</h3>
        <p className="text-sm text-muted-foreground">
          Zet het gerecht op één dag. Het komt <strong>niet</strong> in je bibliotheek.
        </p>
      </div>
      <p className="text-sm font-medium">
        {weekDateLabel
          ? `Het komt op ${weekDateLabel}.`
          : "Je kiest daarna zelf de dag."}
      </p>
      {replacesDishName && (
        <p role="status" className="text-xs font-medium text-pillar-saus">
          Let op: {replacesDishName} staat al op die dag en wordt vervangen.
        </p>
      )}
      {placedLabel && (
        <p role="status" className="rounded-xl bg-sage-tint px-3 py-2 text-sm font-medium text-sage-ink">
          {placedLabel}
        </p>
      )}
      <button
        type="button"
        onClick={handleAddToWeek}
        disabled={!canAddToWeek}
        aria-describedby={blockedReason ? hintId : undefined}
        className={fromPlanner ? primaryButton : cn(neoButton, "w-full py-3")}
      >
        {addingToWeek ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <CalendarPlus className="size-5" aria-hidden />
        )}
        Zet op weekmenu
      </button>
    </div>
  );

  const libraryBlock = (
    <div className="flex flex-col gap-3 rounded-2xl p-4 tactile-sunken">
      <div>
        <h3 className="font-display text-base font-extrabold">In je bibliotheek</h3>
        <p className="text-sm text-muted-foreground">
          Bewaar het gerecht om het later opnieuw te kiezen op elke dag.
        </p>
      </div>
      <button
        type="submit"
        disabled={!canSave}
        aria-describedby={blockedReason ? hintId : undefined}
        className={fromPlanner ? cn(neoButton, "mt-auto w-full py-3") : cn(primaryButton, "mt-auto sm:w-full")}
      >
        <Library className="size-5" aria-hidden />
        Opslaan in bibliotheek
      </button>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      aria-labelledby="save-heading"
      className="tactile-raised rounded-3xl p-4 outline-none sm:p-6"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="save-heading" className="font-display text-xl font-extrabold">
              Jouw gerecht
            </h2>
            <p className="text-sm text-muted-foreground">
              Controleer de titel en kies wat je ermee wilt doen.
            </p>
          </div>
          <button type="button" onClick={onClear} disabled={selectedCount === 0} className={neoButton}>
            <RotateCcw className="size-4" aria-hidden />
            Alles wissen
          </button>
        </div>

        {summary.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog niets gekozen.</p>
        ) : (
          <dl className="flex flex-wrap gap-2">
            {summary.map((pillar) => (
              <div key={pillar.group} className={pillarPill(pillar.group)}>
                <dt className="font-bold">{pillar.badge}:</dt>
                <dd className="font-medium">{draft[pillar.group].join(", ")}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dish-name" className="text-sm font-medium">
              Titel van het gerecht
            </label>
            <input
              id="dish-name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              maxLength={120}
              placeholder="Kies eerst ingrediënten"
              className={neoWell}
            />
            {nameIsCustom && (
              <button
                type="button"
                onClick={onResetName}
                className="cursor-pointer self-start text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Automatische titel gebruiken
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dish-prep-time" className="text-sm font-medium">
              Bereidingstijd
            </label>
            <input
              id="dish-prep-time"
              value={prepTime}
              onChange={(event) => onPrepTimeChange(event.target.value)}
              maxLength={30}
              placeholder="Bijvoorbeeld: 30 min"
              className={neoWell}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {weekBlock}
          {libraryBlock}
        </div>

        {blockedReason && (
          <p id={hintId} className="text-sm text-muted-foreground">
            {blockedReason}
          </p>
        )}
      </form>
      {showQuickBar && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2 rounded-3xl border border-(--tactile-border) bg-(--tactile-bg) p-3 shadow-[0_10px_30px_var(--tactile-shadow),0_2px_6px_var(--tactile-shadow)]">
            <p className="truncate px-1 text-sm font-semibold">{normalizeName(name)}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToWeek}
                disabled={!canAddToWeek}
                className={cn(primaryButton, "gap-2 px-3 py-3 text-sm sm:text-base")}
              >
                {addingToWeek ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                ) : (
                  <CalendarPlus className="size-5" aria-hidden />
                )}
                Weekmenu
              </button>
              <button
                type="button"
                onClick={() => canSave && onSave(buildDish("dish"))}
                disabled={!canSave}
                className={cn(neoButton, "min-h-12 w-full")}
              >
                <Library className="size-5" aria-hidden />
                Bibliotheek
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
