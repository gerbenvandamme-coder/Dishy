"use client";

import { useState, type FormEvent } from "react";
import { Check, Plus, X } from "lucide-react";
import type { IngredientGroup } from "@/types/dish";
import { cn } from "@/lib/utils";
import { neoIconButton, neoSection, neoToggle, neoWell } from "@/components/dishes/neo";
import { PILLAR_BY_GROUP, normalizeName, sameName } from "@/components/dishes/dishHelpers";
import { hasItem, type Draft } from "@/components/configurator/draft";
import { BUILDER_PILLARS, type BuilderPillar } from "@/components/configurator/builderCatalog";
import type { CustomIngredient, NewCustomIngredient } from "@/types/customIngredient";

const MAX_INGREDIENT_LENGTH = 60;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface PillarCardProps {
  pillar: BuilderPillar;
  draft: Draft;
  /** Shared, user-added ingredients. Only the ones for this pillar are shown. */
  customItems: readonly CustomIngredient[];
  onToggle: (group: IngredientGroup, name: string) => void;
  onAdd: (group: IngredientGroup, name: string) => void;
  onAddCustom: (input: NewCustomIngredient) => void;
  onRemoveCustom: (id: string) => void;
}

function PillarCard({
  pillar,
  draft,
  customItems,
  onToggle,
  onAdd,
  onAddCustom,
  onRemoveCustom,
}: PillarCardProps) {
  const groups = Array.from(new Set(pillar.sections.map((section) => section.group)));
  const [value, setValue] = useState("");
  const [targetGroup, setTargetGroup] = useState<IngredientGroup>(groups[0]);
  const headingId = `builder-${pillar.id}`;

  const pillarCustom = customItems.filter((item) => item.pillarId === pillar.id);
  const customFor = (sectionLabel: string) =>
    pillarCustom.filter((item) => item.section === sectionLabel);

  // Selected ingredients of this pillar that are not in the catalog (typed by the user or set by a template).
  const others = groups.flatMap((group) =>
    draft[group]
      .filter(
        (item) =>
          !pillar.sections.some(
            (section) =>
              section.group === group &&
              (section.options.some((option) => sameName(option, item)) ||
                customFor(section.label).some((custom) => sameName(custom.name, item))),
          ),
      )
      .map((name) => ({ group, name })),
  );

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = normalizeName(value);
    if (!name) return;
    const clean = capitalize(name);
    onAdd(targetGroup, clean);

    // Remember it for everyone, unless the catalog already offers it in that subcategory.
    const section = pillar.sections.find((candidate) => candidate.group === targetGroup);
    if (section && !section.options.some((option) => sameName(option, clean))) {
      onAddCustom({ pillarId: pillar.id, section: section.label, group: targetGroup, name: clean });
    }
    setValue("");
  };

  return (
    <section aria-labelledby={headingId} className={cn(neoSection, "flex flex-col gap-4")}>
      <div>
        <h3 id={headingId} className="font-display text-lg font-extrabold">
          {pillar.title}
        </h3>
        <p className="text-xs text-muted-foreground">{pillar.hint}</p>
      </div>

      {pillar.sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {section.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {section.options.map((option) => {
              const pressed = hasItem(draft, section.group, option);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onToggle(section.group, option)}
                  className={neoToggle(pressed, "sm")}
                >
                  {pressed && <Check className="size-4" aria-hidden />}
                  {option}
                </button>
              );
            })}
            {customFor(section.label).map((custom) => {
              const pressed = hasItem(draft, section.group, custom.name);
              return (
                <span key={custom.id} className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => onToggle(section.group, custom.name)}
                    className={neoToggle(pressed, "sm")}
                  >
                    {pressed && <Check className="size-4" aria-hidden />}
                    {custom.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`${custom.name} uit de lijst verwijderen`}
                    onClick={() => onRemoveCustom(custom.id)}
                    className={neoIconButton}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      ))}

      {others.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Overige keuzes
          </p>
          <div className="flex flex-wrap gap-2">
            {others.map(({ group, name }) => (
              <button
                key={`${group}:${name}`}
                type="button"
                aria-pressed
                aria-label={`${name} verwijderen`}
                onClick={() => onToggle(group, name)}
                className={neoToggle(true, "sm")}
              >
                {name}
                <X className="size-4" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={MAX_INGREDIENT_LENGTH}
          placeholder="Zelf iets toevoegen"
          aria-label={`Eigen ingrediënt toevoegen aan ${pillar.title}`}
          className={neoWell}
        />
        {groups.length > 1 && (
          <select
            value={targetGroup}
            onChange={(event) => setTargetGroup(event.target.value as IngredientGroup)}
            aria-label="Toevoegen als"
            className={cn(neoWell, "w-auto shrink-0")}
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {PILLAR_BY_GROUP[group].badge}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          disabled={normalizeName(value).length === 0}
          aria-label="Toevoegen"
          className={neoIconButton}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </form>
    </section>
  );
}

interface CustomDishBuilderProps {
  draft: Draft;
  customItems: readonly CustomIngredient[];
  onToggle: (group: IngredientGroup, name: string) => void;
  onAdd: (group: IngredientGroup, name: string) => void;
  onAddCustom: (input: NewCustomIngredient) => void;
  onRemoveCustom: (id: string) => void;
}

/** Free-form builder: pick or type ingredients under the four pillars. */
export function CustomDishBuilder({
  draft,
  customItems,
  onToggle,
  onAdd,
  onAddCustom,
  onRemoveCustom,
}: CustomDishBuilderProps) {
  return (
    <section aria-labelledby="builder-heading" className="tactile-raised rounded-3xl p-4 sm:p-6">
      <div className="mb-5">
        <h2 id="builder-heading" className="font-display text-xl font-extrabold">
          Zelf samenstellen
        </h2>
        <p className="text-sm text-muted-foreground">
          Tik op een ingrediënt om het toe te voegen. Tik nog eens om het terug te leggen.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {BUILDER_PILLARS.map((pillar) => (
          <PillarCard
            key={pillar.id}
            pillar={pillar}
            draft={draft}
            customItems={customItems}
            onToggle={onToggle}
            onAdd={onAdd}
            onAddCustom={onAddCustom}
            onRemoveCustom={onRemoveCustom}
          />
        ))}
      </div>
    </section>
  );
}