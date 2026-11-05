"use client";

import { Clock, Pencil, Trash2 } from "lucide-react";
import type { Dish } from "@/types/dish";
import { cn } from "@/lib/utils";
import { pillarsInDish } from "@/components/dishes/dishHelpers";
import { neoIconButton, neoListRow, pillSage } from "@/components/dishes/neo";

interface DishRowProps {
  dish: Dish;
  editMode: boolean;
  onOpen: (dish: Dish) => void;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
}

/** One line of the continuous list: no picture, just name, prep time and pillar badges. */
export function DishRow({ dish, editMode, onOpen, onEdit, onDelete }: DishRowProps) {
  const pillars = pillarsInDish(dish);

  return (
    <div className="flex items-center gap-2 px-1">
      <button
        type="button"
        onClick={() => onOpen(dish)}
        aria-label={`Bekijk ${dish.name}`}
        className={neoListRow}
      >
        <span className="flex min-w-48 flex-1 items-center gap-3">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-sage" />
          <span className="font-semibold tracking-tight text-balance">{dish.name}</span>
        </span>
        <span className="flex flex-wrap items-center gap-2">
          {dish.prepTime && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-sage tabular-nums">
              <Clock className="size-3.5" aria-hidden />
              {dish.prepTime}
            </span>
          )}
          {pillars.map((pillar) => (
            <span key={pillar.group} className={pillSage}>
              {pillar.badge}
            </span>
          ))}
        </span>
      </button>

      {editMode && (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onEdit(dish)}
            aria-label={`Bewerk ${dish.name}`}
            className={neoIconButton}
          >
            <Pencil className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDelete(dish)}
            aria-label={`Verwijder ${dish.name}`}
            className={cn(neoIconButton, "text-destructive")}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}