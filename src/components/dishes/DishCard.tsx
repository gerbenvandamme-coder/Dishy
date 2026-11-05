"use client";

import { Clock, Pencil, Trash2 } from "lucide-react";
import type { Dish } from "@/types/dish";
import { cn } from "@/lib/utils";
import { DishImage } from "@/components/dishes/DishImage";
import { pillarsInDish } from "@/components/dishes/dishHelpers";
import { neoCard, neoIconButton, pillInset, pillRaised } from "@/components/dishes/neo";

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
    <article className="relative">
      <button
        type="button"
        onClick={() => onOpen(dish)}
        aria-label={`Bekijk ${dish.name}`}
        className={neoCard}
      >
        <DishImage src={dish.imageUrl} alt={dish.name} className="aspect-[4/3] w-full" />
        <span className="flex flex-col gap-3">
          <span className="block text-lg leading-tight font-semibold tracking-tight text-balance">
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
              <span key={pillar.group} className={pillRaised}>
                {pillar.badge}
              </span>
            ))}
          </span>
        </span>
      </button>

      {editMode && (
        <div className="absolute top-6 right-6 flex gap-2">
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