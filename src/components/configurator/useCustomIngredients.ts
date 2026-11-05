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
import { customIngredientId } from "@/components/configurator/customIngredients";

/**
 * The shared list of user-added ingredients. It loads on mount and reloads whenever
 * another user changes the table (Supabase realtime), so everyone sees the same list.
 */
export function useCustomIngredients() {
  const [items, setItems] = useState<CustomIngredient[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      getCustomIngredients()
        .then((loaded) => {
          if (!cancelled) setItems(loaded);
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

  const add = useCallback((input: NewCustomIngredient) => {
    const name = normalizeName(input.name);
    if (!name) return;
    const item: CustomIngredient = {
      id: customIngredientId(input.pillarId, input.section, name),
      name,
      pillarId: input.pillarId,
      section: input.section,
      group: input.group,
      createdAt: new Date().toISOString(),
    };
    setItems((previous) =>
      previous.some((existing) => existing.id === item.id) ? previous : [...previous, item],
    );
    saveCustomIngredient(item).catch((error: unknown) => {
      console.warn("[custom-ingredients] Could not save ingredient.", error);
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
    deleteCustomIngredient(id).catch((error: unknown) => {
      console.warn("[custom-ingredients] Could not delete ingredient.", error);
    });
  }, []);

  return { items, add, remove };
}