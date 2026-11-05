"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dish, IngredientGroup } from "@/types/dish";
import { useApp } from "@/components/app/AppProvider";
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

/** Where the user lands after saving a dish. */
const AFTER_SAVE_PATH = "/gerechten";

/**
 * Owns the dish being composed. The template wizard and the free-form builder both
 * write to the same draft, and the save panel turns it into a library dish.
 */
export function ConfiguratorWorkspace() {
  const router = useRouter();
  const { dishes, upsertDish } = useApp();

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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl leading-tight font-black tracking-tight sm:text-4xl">
          Stel een gerecht samen
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Start met een template of kies zelf je ingrediënten. Bewaar het resultaat daarna in je
          bibliotheek.
        </p>
      </header>

      <TemplateWizard hasExistingDraft={countItems(draft) > 0} onApply={handleApplyTemplate} />

      <CustomDishBuilder draft={draft} onToggle={handleToggle} onAdd={handleAdd} />

      <SaveDishPanel
        sectionRef={saveSectionRef}
        draft={draft}
        name={name}
        nameIsCustom={customName !== null}
        prepTime={prepTime}
        ready={dishes !== null}
        onNameChange={setCustomName}
        onResetName={() => setCustomName(null)}
        onPrepTimeChange={setPrepTime}
        onClear={handleClear}
        onSave={handleSave}
      />
    </div>
  );
}