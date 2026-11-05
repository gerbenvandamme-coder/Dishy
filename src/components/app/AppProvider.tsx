"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Dish } from "@/types/dish";
import { cn } from "@/lib/utils";
import { deleteDish, getDishes, saveDishes } from "@/lib/supabase";
import { mockDishes } from "@/lib/mockDishes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dialogSurface, neoButton } from "@/components/dishes/neo";

const CONFIGURATOR_PATH = "/configurator";

interface AppContextValue {
  /** null while the dishes are loading. */
  dishes: Dish[] | null;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  /** Adds the dish, or replaces the dish with the same id. */
  upsertDish: (dish: Dish) => void;
  /** Opens the delete confirmation. */
  requestDelete: (dish: Dish) => void;
  /** Navigates to the configurator page. */
  openConfigurator: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>.");
  return context;
}

/**
 * Holds the state shared by every page: the dish library, the global edit mode
 * and the delete confirmation.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [editMode, setEditMode] = useState(false);

  // The target stays set while the dialog closes, so the exit animation does not go blank.
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDishes()
      .then((loaded) => {
        if (!cancelled) setDishes(loaded);
      })
      .catch((error: unknown) => {
        console.warn("[dishes] Could not load dishes, showing the sample dishes.", error);
        if (!cancelled) setDishes(mockDishes);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = (next: Dish[]) => {
    setDishes(next);
    saveDishes(next).catch((error: unknown) => {
      console.warn("[dishes] Could not save dishes.", error);
    });
  };

  const upsertDish = (dish: Dish) => {
    if (!dishes) return;
    const exists = dishes.some((existing) => existing.id === dish.id);
    commit(
      exists
        ? dishes.map((existing) => (existing.id === dish.id ? dish : existing))
        : [...dishes, dish],
    );
  };

  const requestDelete = (dish: Dish) => {
    setDeleteTarget(dish);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget || !dishes) return;
    const { id } = deleteTarget;
    commit(dishes.filter((dish) => dish.id !== id));
    deleteDish(id).catch((error: unknown) => {
      console.warn("[dishes] Could not delete dish.", error);
    });
    setDeleteOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        dishes,
        editMode,
        setEditMode,
        upsertDish,
        requestDelete,
        openConfigurator: () => router.push(CONFIGURATOR_PATH),
      }}
    >
      {children}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className={cn(dialogSurface, "sm:max-w-md")}>
          <DialogHeader className="pr-10">
            <DialogTitle className="font-display text-xl font-extrabold tracking-tight">
              Gerecht verwijderen?
            </DialogTitle>
            <DialogDescription>
              {deleteTarget ? `“${deleteTarget.name}”` : "Dit gerecht"} wordt definitief verwijderd.
              Dit kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setDeleteOpen(false)} className={neoButton}>
              Annuleren
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className={cn(neoButton, "text-destructive")}
            >
              Verwijderen
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppContext.Provider>
  );
}