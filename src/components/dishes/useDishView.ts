"use client";

import { useCallback, useSyncExternalStore } from "react";

/** How the Gerechten page lists dishes: photo cards, or one continuous list without pictures. */
export type DishView = "cards" | "list";

const STORAGE_KEY = "dishy:dishes-view";
const DEFAULT_VIEW: DishView = "cards";

const listeners = new Set<() => void>();

function readView(): DishView {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "list" ? "list" : DEFAULT_VIEW;
  } catch {
    return DEFAULT_VIEW;
  }
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * The chosen listing style, remembered in localStorage. The server and the first client
 * render use the default, so hydration never mismatches.
 */
export function useDishView(): [DishView, (view: DishView) => void] {
  const view = useSyncExternalStore(subscribe, readView, () => DEFAULT_VIEW);

  const setView = useCallback((next: DishView) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private mode). The choice then only lasts until reload.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [view, setView];
}