"use client";

import { useMemo, useState } from "react";
import { ChefHat, Plus } from "lucide-react";
import type { Dish } from "@/types/dish";
import { useApp } from "@/components/app/AppProvider";
import { CollapsibleSearch, searchSiblingClass } from "@/components/dishes/CollapsibleSearch";
import { DishCard } from "@/components/dishes/DishCard";
import { DishDetailModal } from "@/components/dishes/DishDetailModal";
import { createId } from "@/components/dishes/dishHelpers";
import { dishMatchesTerms, parseSearchTerms } from "@/components/dishes/dishSearch";
import { neoButton, sageButton } from "@/components/dishes/neo";

function createBlankDish(): Dish {
  return {
    id: createId("dish"),
    name: "",
    category: "vaste_gerechten",
    ingredients: [],
    variations: [],
  };
}

/** The dish library: search, card grid and detail modal. Edit mode, the configurator and delete confirmation come from AppProvider. */
export function DishLibrary() {
  const { dishes, editMode, upsertDish, requestDelete, openConfigurator } = useApp();

  // The dish stays set while the dialog closes, so the exit animation does not go blank.
  const [selected, setSelected] = useState<Dish | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const terms = useMemo(() => parseSearchTerms(query), [query]);
  const visible = useMemo(
    () => (dishes ?? []).filter((dish) => dishMatchesTerms(dish, terms)),
    [dishes, terms],
  );

  const openDish = (dish: Dish) => {
    setSelected(dish);
    setDetailOpen(true);
  };

  const handleSave = (dish: Dish) => {
    upsertDish(dish);
    setDetailOpen(false);
  };

  const handleDelete = (dish: Dish) => {
    setDetailOpen(false);
    requestDelete(dish);
  };

  const isNew = selected !== null && !(dishes ?? []).some((dish) => dish.id === selected.id);

  let countText: string;
  if (dishes === null) {
    countText = "Gerechten laden…";
  } else if (terms.length > 0) {
    countText = `${visible.length} van ${dishes.length} ${dishes.length === 1 ? "gerecht" : "gerechten"}`;
  } else {
    countText = `${dishes.length} ${dishes.length === 1 ? "gerecht" : "gerechten"} in je bibliotheek`;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-5 lg:flex-nowrap lg:gap-y-0">
        {/* Below sm this row holds the title and the collapsible search. From sm up it dissolves
            (sm:contents), so the search and the buttons share one row. From lg up the title
            joins that row as well. */}
        <div className="flex items-center justify-between sm:contents">
          <div className={`${searchSiblingClass(searchOpen)} sm:order-1 sm:basis-full lg:basis-auto lg:flex-1`}>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Gerechten</h1>
            <p className="mt-1 truncate text-muted-foreground" aria-live="polite">
              {countText}
            </p>
          </div>
          <CollapsibleSearch
            value={query}
            onChange={setQuery}
            label="Zoek op naam of ingrediënt"
            onExpandedChange={setSearchOpen}
            className="sm:order-2"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:order-3">
          <button type="button" onClick={openConfigurator} className={`${neoButton} h-11`}>
            <ChefHat className="size-4" aria-hidden />
            Stel een gerecht samen
          </button>
          {editMode && (
            <button
              type="button"
              onClick={() => openDish(createBlankDish())}
              className={`${neoButton} h-11`}
            >
              <Plus className="size-4" aria-hidden />
              Nieuw gerecht
            </button>
          )}
        </div>
      </header>

      {dishes === null ? (
        <ul aria-busy="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <li
              key={index}
              className="h-80 animate-pulse rounded-3xl bg-(--tactile-bg) tactile-sunken motion-reduce:animate-none"
            />
          ))}
        </ul>
      ) : dishes.length === 0 ? (
        <p className="rounded-3xl bg-(--tactile-bg) p-8 text-center text-muted-foreground tactile-sunken">
          Nog geen gerechten. Stel er een samen
          {editMode ? " of voeg een nieuw gerecht toe." : "."}
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-3xl bg-(--tactile-bg) p-8 text-center text-muted-foreground tactile-sunken">
          {`Geen gerechten gevonden voor “${query.trim()}”. `}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Zoekopdracht wissen
          </button>
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((dish) => (
            <li key={dish.id}>
              <DishCard
                dish={dish}
                editMode={editMode}
                onOpen={openDish}
                onEdit={openDish}
                onDelete={requestDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <DishDetailModal
        dish={selected}
        open={detailOpen}
        editMode={editMode}
        isNew={isNew}
        onOpenChange={setDetailOpen}
        onSave={handleSave}
        onRequestDelete={handleDelete}
      />
    </div>
  );
}