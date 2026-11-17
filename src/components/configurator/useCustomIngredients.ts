"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomIngredient, NewCustomIngredient } from "@/types/customIngredient";
import {
  deleteCustomIngredient,
  getCustomIngredients,
  saveCustomIngredient,
  subscribeToCustomIngredients,
} from "@/lib/supabase";
import { normalizeName } from "@/components/dishes/dishHelpers";
import {
  customIngredientId,
  hiddenIngredientId,
  isHiddenMarker,
} from "@/components/configurator/customIngredients";

/**
 * The shared list of user-added ingredients. It loads on mount and reloads whenever
 * another user changes the table (Supabase realtime), so everyone sees the same list.
 */
export function useCustomIngredients() {
  const [rows, setRows] = useState<CustomIngredient[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      getCustomIngredients()
        .then((loaded) => {
          if (!cancelled) setRows(loaded);
        })
        .catch((error: unknown) => {
          console.warn("[custom-ingredients] Could not load ingredients.", error);
        });
    };

    load();
    const unsubscribe = subscribeToCustomIngredients(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const store = useCallback((input: NewCustomIngredient, hidden: boolean) => {
    const name = normalizeName(input.name);
    if (!name) return;
    const item: CustomIngredient = {
      id: (hidden ? hiddenIngredientId : customIngredientId)(input.pillarId, input.section, name),
      name,
      pillarId: input.pillarId,
      section: input.section,
      group: input.group,
      createdAt: new Date().toISOString(),
    };
    setRows((previous) =>
      previous.some((existing) => existing.id === item.id) ? previous : [...previous, item],
    );
    saveCustomIngredient(item).catch((error: unknown) => {
      console.warn("[custom-ingredients] Could not save ingredient.", error);
    });
  }, []);

  const add = useCallback((input: NewCustomIngredient) => store(input, false), [store]);

  /** Hides a built-in option for everyone. */
  const hide = useCallback((input: NewCustomIngredient) => store(input, true), [store]);

  const remove = useCallback((id: string) => {
    setRows((previous) => previous.filter((item) => item.id !== id));
    deleteCustomIngredient(id).catch((error: unknown) => {
      console.warn("[custom-ingredients] Could not delete ingredient.", error);
    });
  }, []);

  const items = rows.filter((row) => !isHiddenMarker(row.id));
  const hidden = rows.filter((row) => isHiddenMarker(row.id));

  return { items, hidden, add, hide, remove };
}