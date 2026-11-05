"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import type { Dish, Ingredient } from "@/types/dish";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/app/AppProvider";
import {
  INGREDIENT_CATALOG,
  TRAY_GROUPS,
  type TrayGroup,
} from "@/components/dishes/ingredientCatalog";
import { PILLAR_BY_GROUP, createId, normalizeName } from "@/components/dishes/dishHelpers";
import { neoButton, neoSection, neoToggle, neoWell } from "@/components/dishes/neo";

type Selection = Record<TrayGroup, string[]>;

const EMPTY_SELECTION: Selection = { eiwit: [], basis: [], groenten: [], saus: [] };

/** Where the user lands after saving a dish. */
const AFTER_SAVE_PATH = "/gerechten";

function lowercaseFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function joinDutch(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`;
}

/** Builds a name such as "Biefstuk met frietjes, witloofsalade en pepersaus". */
function suggestName(selection: Selection): string {
  const names = TRAY_GROUPS.flatMap((group) => selection[group]);
  if (names.length === 0) return "";
  const [first, ...rest] = names;
  return rest.length > 0 ? `${first} met ${joinDutch(rest.map(lowercaseFirst))}` : first;
}

interface ConfiguratorFormProps {
  /** False while the dish library is still loading, because saving needs it. */
  ready: boolean;
  onSave: (dish: Dish) => void;
}

function ConfiguratorForm({ ready, onSave }: ConfiguratorFormProps) {
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const [customName, setCustomName] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState("");

  const name = customName ?? suggestName(selection);
  const selectedCount = TRAY_GROUPS.reduce((total, group) => total + selection[group].length, 0);
  const canSave = ready && selectedCount > 0 && normalizeName(name).length > 0;

  const toggle = (group: TrayGroup, item: string) =>
    setSelection((previous) => {
      const selected = previous[group].includes(item);
      return {
        ...previous,
        [group]: selected
          ? previous[group].filter((existing) => existing !== item)
          : [...previous[group], item],
      };
    });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    const ingredients: Ingredient[] = TRAY_GROUPS.flatMap((group) =>
      selection[group].map((item) => ({
        id: createId("ing"),
        name: item,
        group,
        isSelected: true,
      })),
    );

    onSave({
      id: createId("dish"),
      name: normalizeName(name),
      prepTime: normalizeName(prepTime) || undefined,
      category: "geconfigureerd",
      ingredients,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl leading-tight font-black tracking-tight sm:text-4xl">
          Stel een gerecht samen
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Kies per vak wat erbij hoort. Tik nog eens op een ingrediënt om het terug te leggen.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {TRAY_GROUPS.map((group) => {
          const pillar = PILLAR_BY_GROUP[group];
          const headingId = `tray-${group}`;
          return (
            <section
              key={group}
              aria-labelledby={headingId}
              className={cn(neoSection, "flex flex-col gap-3")}
            >
              <div>
                <h2 id={headingId} className="font-display text-lg font-extrabold">
                  {pillar.title}
                </h2>
                <p className="text-xs text-muted-foreground">{pillar.hint}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {INGREDIENT_CATALOG[group].map((item) => {
                  const pressed = selection[group].includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => toggle(group, item)}
                      className={neoToggle(pressed, "sm")}
                    >
                      {pressed && <Check className="size-4" aria-hidden />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Naam van het gerecht
          <input
            value={name}
            onChange={(event) => setCustomName(event.target.value)}
            maxLength={120}
            placeholder="Kies eerst ingrediënten"
            className={neoWell}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Bereidingstijd
          <input
            value={prepTime}
            onChange={(event) => setPrepTime(event.target.value)}
            maxLength={30}
            placeholder="Bijvoorbeeld: 30 min"
            className={neoWell}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={!canSave} className={neoButton}>
          <Save className="size-4" aria-hidden />
          Gerecht opslaan
        </button>
      </div>
    </form>
  );
}

/**
 * Tray layout on its own page: compose a meal from Eiwit, Basis, Groenten and Saus,
 * save it to the library and continue to the dish overview.
 */
export function DishConfigurator() {
  const router = useRouter();
  const { dishes, upsertDish } = useApp();

  const handleSave = (dish: Dish) => {
    upsertDish(dish);
    router.push(AFTER_SAVE_PATH);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="tactile-raised rounded-3xl p-5 sm:p-8">
        <ConfiguratorForm ready={dishes !== null} onSave={handleSave} />
      </div>
    </div>
  );
}