"use client";

import { useState, type FormEvent } from "react";
import { Check, Plus, RotateCcw, X } from "lucide-react";
import type { IngredientGroup } from "@/types/dish";
import { cn } from "@/lib/utils";
import {
  PILLAR_STYLE,
  neoSection,
  neoToggle,
  neoWell,
} from "@/components/dishes/neo";
import { PILLAR_BY_GROUP, normalizeName, sameName } from "@/components/dishes/dishHelpers";
import { hasItem, type Draft } from "@/components/configurator/draft";
import {
  BUILDER_PILLARS,
  type BuilderPillar,
  type BuilderSection,
} from "@/components/configurator/builderCatalog";
import type { CustomIngredient, NewCustomIngredient } from "@/types/customIngredient";
import { hiddenIngredientId } from "@/components/configurator/customIngredients";

const MAX_INGREDIENT_LENGTH = 60;
const MAX_SECTION_LENGTH = 40;

/** Value of the "new subtitle" entry in the subtitle picker. Cannot clash with a real label. */
const NEW_SECTION = "__nieuw__";

const REMOVE_BADGE =
  "absolute -top-2 -right-2 z-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-full bg-(--tactile-bg) text-destructive shadow-[2px_2px_4px_var(--tactile-shadow),-1px_-1px_3px_var(--tactile-highlight)] after:absolute after:-inset-2.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface PillarCardProps {
  pillar: BuilderPillar;
  draft: Draft;
  /** Shared, user-added ingredients. Only the ones for this pillar are shown. */
  customItems: readonly CustomIngredient[];
  /** Built-in options someone removed. Stored as marker rows in the same shared list. */
  hiddenItems: readonly CustomIngredient[];
  /** Remove buttons only show in edit mode. */
  editMode: boolean;
  onToggle: (group: IngredientGroup, name: string) => void;
  onAdd: (group: IngredientGroup, name: string) => void;
  onAddCustom: (input: NewCustomIngredient) => void;
  onHideBuiltIn: (input: NewCustomIngredient) => void;
  /** Deletes a custom ingredient, or brings a hidden built-in option back. */
  onRemoveCustom: (id: string) => void;
}

function PillarCard({
  pillar,
  draft,
  customItems,
  hiddenItems,
  editMode,
  onToggle,
  onAdd,
  onAddCustom,
  onHideBuiltIn,
  onRemoveCustom,
}: PillarCardProps) {
  const groups = Array.from(new Set(pillar.sections.map((section) => section.group)));
  const accent = PILLAR_STYLE[groups[0]];
  const [value, setValue] = useState("");
  const [sectionKey, setSectionKey] = useState(pillar.sections[0].label);
  const [newSection, setNewSection] = useState("");
  const [newGroup, setNewGroup] = useState<IngredientGroup>(groups[0]);
  // The add form is folded away until it is needed, so the four pillars stay short on a phone.
  const [addOpen, setAddOpen] = useState(false);
  const headingId = `builder-${pillar.id}`;

  const pillarCustom = customItems.filter((item) => item.pillarId === pillar.id);
  const pillarHidden = hiddenItems.filter((item) => item.pillarId === pillar.id);
  const hiddenIds = new Set(pillarHidden.map((item) => item.id));
  const isHidden = (sectionLabel: string, option: string) =>
    hiddenIds.has(hiddenIngredientId(pillar.id, sectionLabel, option));
  const customFor = (sectionLabel: string) =>
    pillarCustom.filter((item) => item.section === sectionLabel);

  // Subtitles someone created themselves: they only exist through their ingredients.
  const ownSections: BuilderSection[] = [];
  for (const item of pillarCustom) {
    const known =
      pillar.sections.some((section) => sameName(section.label, item.section)) ||
      ownSections.some((section) => sameName(section.label, item.section));
    if (!known) ownSections.push({ label: item.section, group: item.group, options: [] });
  }
  const allSections: readonly BuilderSection[] = [...pillar.sections, ...ownSections];

  const addingToNew = sectionKey === NEW_SECTION;
  const trimmedNewSection = capitalize(normalizeName(newSection));
  const canAdd =
    normalizeName(value).length > 0 && (!addingToNew || trimmedNewSection.length > 0);

  // Selected ingredients of this pillar that are not in the catalog (typed by the user or set by a template).
  const others = groups.flatMap((group) =>
    draft[group]
      .filter(
        (item) =>
          !allSections.some(
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
    if (!canAdd) return;
    const clean = capitalize(normalizeName(value));

    const chosen = addingToNew
      ? undefined
      : (allSections.find((section) => section.label === sectionKey) ?? allSections[0]);
    const sectionLabel = chosen ? chosen.label : trimmedNewSection;
    const group = chosen ? chosen.group : newGroup;

    onAdd(group, clean);

    // Remember it for everyone, unless the subtitle already offers it.
    const alreadyListed =
      (chosen?.options.some((option) => sameName(option, clean)) ?? false) ||
      customFor(sectionLabel).some((custom) => sameName(custom.name, clean));
    if (!alreadyListed) {
      onAddCustom({ pillarId: pillar.id, section: sectionLabel, group, name: clean });
    }

    // After creating a new subtitle it becomes the selected one.
    if (addingToNew) {
      setSectionKey(sectionLabel);
      setNewSection("");
    }
    setValue("");
  };

  return (
    <section aria-labelledby={headingId} className={cn(neoSection, accent.panel, "flex flex-col gap-4")}>
      <div>
        <h3 id={headingId} className={cn("font-display text-lg font-extrabold", accent.text)}>
          {pillar.title}
        </h3>
        <p className="text-xs text-muted-foreground">{pillar.hint}</p>
      </div>

      {allSections.map((section) => {
        const own = customFor(section.label);
        const visibleOptions = section.options.filter((option) => !isHidden(section.label, option));
        if (visibleOptions.length === 0 && own.length === 0 && !editMode) return null;
        const chosenCount =
          visibleOptions.filter((option) => hasItem(draft, section.group, option)).length +
          own.filter((custom) => hasItem(draft, section.group, custom.name)).length;
        return (
          <div key={section.label} className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-foreground/80 uppercase">
              <span aria-hidden className={cn("size-2 rounded-full", accent.dot)} />
              {section.label}
              {chosenCount > 0 && (
                <span className="rounded-full bg-sage-tint px-2 py-0.5 text-[0.7rem] font-semibold text-sage-ink normal-case">
                  {chosenCount} gekozen
                </span>
              )}
            </p>
            <div className={cn("flex flex-wrap gap-2", editMode && "gap-3 pt-1")}>
              {visibleOptions.map((option) => {
                const pressed = hasItem(draft, section.group, option);
                return (
                  <span key={option} className="relative inline-flex">
                    <button
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => onToggle(section.group, option)}
                      className={neoToggle(pressed, "sm")}
                    >
                      {pressed && <Check className="size-4" aria-hidden />}
                      {option}
                    </button>
                    {editMode && (
                      <button
                        type="button"
                        aria-label={`${option} uit de lijst verwijderen`}
                        onClick={() =>
                          onHideBuiltIn({
                            pillarId: pillar.id,
                            section: section.label,
                            group: section.group,
                            name: option,
                          })
                        }
                        className={REMOVE_BADGE}
                      >
                        <X className="size-3.5" strokeWidth={3} aria-hidden />
                      </button>
                    )}
                  </span>
                );
              })}
              {own.map((custom) => {
                const pressed = hasItem(draft, section.group, custom.name);
                return (
                  <span key={custom.id} className="relative inline-flex">
                    <button
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => onToggle(section.group, custom.name)}
                      className={neoToggle(pressed, "sm")}
                    >
                      {pressed && <Check className="size-4" aria-hidden />}
                      {custom.name}
                    </button>
                    {editMode && (
                      <button
                        type="button"
                        aria-label={`${custom.name} uit de lijst verwijderen`}
                        onClick={() => onRemoveCustom(custom.id)}
                        className={REMOVE_BADGE}
                      >
                        <X className="size-3.5" strokeWidth={3} aria-hidden />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}

      {others.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-wide text-foreground/80 uppercase">
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

      {editMode && pillarHidden.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-xs font-bold tracking-wide text-foreground/80 uppercase">
            Verwijderd ({pillarHidden.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {pillarHidden.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`${item.name} terugzetten`}
                onClick={() => onRemoveCustom(item.id)}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-2xl px-3 text-sm text-muted-foreground line-through decoration-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring pointer-coarse:min-h-11"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {addOpen ? (
        <form
          onSubmit={handleAdd}
          aria-label={`Eigen ingrediënt toevoegen aan ${pillar.title}`}
          className="flex flex-col gap-2 border-t border-border pt-4"
        >
          <p className="text-xs font-bold tracking-wide text-foreground/80 uppercase">
            Zelf iets toevoegen
          </p>
          <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={MAX_INGREDIENT_LENGTH}
            placeholder="Naam van het ingrediënt"
            aria-label={`Naam van het nieuwe ingrediënt voor ${pillar.title}`}
            className={neoWell}
          />

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={`${headingId}-section`} className="text-sm text-muted-foreground">
              Onder
            </label>
            <select
              id={`${headingId}-section`}
              value={sectionKey}
              onChange={(event) => setSectionKey(event.target.value)}
              className={cn(neoWell, "w-auto min-w-0 flex-1")}
            >
              {allSections.map((section) => (
                <option key={section.label} value={section.label}>
                  {section.label}
                </option>
              ))}
              <option value={NEW_SECTION}>+ Nieuwe subtitel…</option>
            </select>
          </div>

          {addingToNew && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={newSection}
                onChange={(event) => setNewSection(event.target.value)}
                maxLength={MAX_SECTION_LENGTH}
                placeholder="Naam van de nieuwe subtitel"
                aria-label="Naam van de nieuwe subtitel"
                className={cn(neoWell, "min-w-0 flex-1")}
              />
              {groups.length > 1 && (
                <select
                  value={newGroup}
                  onChange={(event) => setNewGroup(event.target.value as IngredientGroup)}
                  aria-label="Hoort bij"
                  className={cn(neoWell, "w-auto shrink-0")}
                >
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {PILLAR_BY_GROUP[group].badge}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl px-4 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Sluiten
            </button>
            <button
              type="submit"
              disabled={!canAdd}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-(--tactile-bg) px-4 py-2.5 text-sm font-semibold text-sage-ink tactile-btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <Plus className="size-4" aria-hidden />
              Toevoegen
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          aria-expanded={false}
          onClick={() => setAddOpen(true)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-2xl px-2 text-sm font-semibold text-sage-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden />
          Iets anders toevoegen
        </button>
      )}
    </section>
  );
}

type CustomDishBuilderProps = Omit<PillarCardProps, "pillar">;

/** Free-form builder: pick or type ingredients under the four pillars. */
export function CustomDishBuilder(props: CustomDishBuilderProps) {
  const { editMode } = props;
  return (
    <section aria-labelledby="builder-heading" className="tactile-raised rounded-3xl p-4 sm:p-6">
      <div className="mb-5">
        <h2 id="builder-heading" className="font-display text-xl font-extrabold">
          Zelf samenstellen
        </h2>
        <p className="text-sm text-muted-foreground">
          {editMode
            ? "Bewerkmodus: tik op het kruisje om een ingrediënt voor iedereen uit de lijst te halen. Onderaan elke groep zet je verwijderde ingrediënten terug."
            : "Tik op een ingrediënt om het toe te voegen. Tik nog eens om het terug te leggen. Mis je iets? Voeg het toe en kies onder welke subtitel het hoort."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {BUILDER_PILLARS.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} {...props} />
        ))}
      </div>
    </section>
  );
}
