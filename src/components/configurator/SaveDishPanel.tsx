"use client";

import { useId, type FormEvent, type RefObject } from "react";
import { RotateCcw, Save } from "lucide-react";
import type { Dish } from "@/types/dish";
import { neoButton, neoWell, pillRaised } from "@/components/dishes/neo";
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
  onNameChange: (name: string) => void;
  onResetName: () => void;
  onPrepTimeChange: (prepTime: string) => void;
  onClear: () => void;
  onSave: (dish: Dish) => void;
}

/** Summary of the composed dish, an editable title and the save button. */
export function SaveDishPanel({
  sectionRef,
  draft,
  name,
  nameIsCustom,
  prepTime,
  ready,
  onNameChange,
  onResetName,
  onPrepTimeChange,
  onClear,
  onSave,
}: SaveDishPanelProps) {
  const hintId = useId();
  const selectedCount = countItems(draft);
  const hasName = normalizeName(name).length > 0;
  const canSave = ready && selectedCount > 0 && hasName;

  let blockedReason = "";
  if (selectedCount === 0) blockedReason = "Kies eerst minstens één ingrediënt.";
  else if (!hasName) blockedReason = "Geef het gerecht een naam.";
  else if (!ready) blockedReason = "De bibliotheek wordt nog geladen.";

  const summary = DETAIL_PILLARS.filter((pillar) => draft[pillar.group].length > 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    onSave({
      id: createId("dish"),
      name: normalizeName(name),
      prepTime: normalizeName(prepTime) || undefined,
      category: "geconfigureerd",
      ingredients: draftToIngredients(draft),
    });
  };

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
              Controleer de titel en bewaar het gerecht in je bibliotheek.
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
              <div key={pillar.group} className={pillRaised}>
                <dt className="text-muted-foreground">{pillar.badge}:</dt>
                <dd>{draft[pillar.group].join(", ")}</dd>
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

        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="submit"
            disabled={!canSave}
            aria-describedby={blockedReason ? hintId : undefined}
            className={primaryButton}
          >
            <Save className="size-5" aria-hidden />
            Gerecht Opslaan in Bibliotheek
          </button>
          {blockedReason && (
            <p id={hintId} className="text-sm text-muted-foreground">
              {blockedReason}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}