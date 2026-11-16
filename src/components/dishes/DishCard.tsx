"use client";

import { Clock, Pencil, Trash2 } from "lucide-react";
import type { Dish } from "@/types/dish";
import { cn } from "@/lib/utils";
import { DishImage } from "@/components/dishes/DishImage";
import { pillarsInDish } from "@/components/dishes/dishHelpers";
import { neoCard, neoIconButton, pillInset, pillarPill } from "@/components/dishes/neo";

interface DishCardProps {
  dish: Dish;
  editMode: boolean;
  onOpen: (dish: Dish) => void;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
}

/** Raised card. Shows photo, title, prep time and pillar badges, but no ingredient list. */
export function DishCard({ dish, editMode, onOpen, onEdit, onDelete }: DishCardProps) {
  const pillars = pillarsInDish(dish);

  return (
    <article className="relative h-full">
      <button
        type="button"
        onClick={() => onOpen(dish)}
        aria-label={`Bekijk ${dish.name}`}
        className={cn(neoCard, "h-full max-sm:gap-3 max-sm:rounded-2xl max-sm:p-2.5")}
      >
        <DishImage src={dish.imageUrl} alt={dish.name} width={420} className="aspect-[4/3] w-full max-sm:p-1" />
        <span className="flex flex-col gap-3 max-sm:gap-2 max-sm:px-1 max-sm:pb-1">
          <span className="line-clamp-3 text-sm leading-tight font-semibold tracking-tight text-balance sm:text-lg">
            {dish.name}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            {dish.prepTime && (
              <span className={pillInset}>
                <Clock className="size-3.5" aria-hidden />
                {dish.prepTime}
              </span>
            )}
            {pillars.map((pillar) => (
              <span key={pillar.group} className={cn(pillarPill(pillar.group), "max-sm:hidden")}>
                {pillar.badge}
              </span>
            ))}
          </span>
        </span>
      </button>

      {editMode && (
        <div className="absolute top-4 right-4 flex gap-2 sm:top-6 sm:right-6">
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
    </article>
  );
}