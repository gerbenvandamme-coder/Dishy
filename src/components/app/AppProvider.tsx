"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Dish } from "@/types/dish";
import { cn } from "@/lib/utils";
import { deleteDish, getDishes, saveDish } from "@/lib/supabase";
import { subscribeToDishes } from "@/lib/realtime";
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

/** Replaces the dish with the same id, or appends it when it is new. */
function mergeDish(list: Dish[], dish: Dish): Dish[] {
  return list.some((existing) => existing.id === dish.id)
    ? list.map((existing) => (existing.id === dish.id ? dish : existing))
    : [...list, dish];
}

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

  // Changes from other family members. Our own writes echo back and replace the dish with the same data.
  useEffect(() => {
    return subscribeToDishes({
      onUpsert: (dish) => setDishes((previous) => (previous ? mergeDish(previous, dish) : previous)),
      onDelete: (id) =>
        setDishes((previous) => (previous ? previous.filter((dish) => dish.id !== id) : previous)),
      onResync: () => {
        getDishes()
          .then(setDishes)
          .catch((error: unknown) => {
            console.warn("[dishes] Could not refresh the dishes.", error);
          });
      },
    });
  }, []);

  const upsertDish = (dish: Dish) => {
    if (!dishes) return;
    setDishes((previous) => (previous ? mergeDish(previous, dish) : previous));
    saveDish(dish).catch((error: unknown) => {
      console.warn("[dishes] Could not save the dish.", error);
    });
  };

  const requestDelete = (dish: Dish) => {
    setDeleteTarget(dish);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDishes((previous) => (previous ? previous.filter((dish) => dish.id !== id) : previous));
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