"use client";

import { useState, type DragEvent } from "react";
import { ArrowLeftRight, GripVertical, Plus, Trash2 } from "lucide-react";
import type { Dish } from "@/types/dish";
import { cn } from "@/lib/utils";
import { DishImage } from "@/components/dishes/DishImage";
import { neoCard, neoIconButton, pillInset, pillSage } from "@/components/dishes/neo";
import { formatShortDate } from "@/components/calendar/weekUtils";

export interface DaySlot {
  date: string;
  dayOfWeek: string;
  dish?: Dish;
  activeVariations: string[];
}

interface WeekViewProps {
  slots: DaySlot[];
  todayKey: string;
  /** The day whose dish is open in the detail modal. */
  selectedDate: string | null;
  /** Unlocks swapping and dragging. Removing a dish never needs it. */
  editMode: boolean;
  onOpenDish: (slot: DaySlot) => void;
  onPick: (date: string) => void;
  onClear: (date: string) => void;
  onMove: (from: string, to: string) => void;
}

/** Today and the selected day sit slightly higher than the other tiles. */
const LIFT = "-translate-y-1";

/**
 * Today gets a debossed sage border. The important modifiers are needed because the
 * tactile-raised utility sets its own 1px border and would otherwise win or lose by CSS order.
 */
const TODAY_BORDER = "border-2! border-[#557A61]/50!";

/** The selected day (open in the detail modal) gets a sage ring. */
const SELECTED_RING = "ring-2 ring-sage/70";

const DROP_TARGET = "outline-2 outline-offset-2 outline-dashed outline-sage";

/** Small glowing sage dot next to the title of the current day. */
const TODAY_DOT = "ml-1.5 size-2.5 shrink-0 rounded-full bg-sage shadow-[0_0_8px_1px_var(--sage)]";

/** Keeps the day title clear of the round buttons in the tile's top-right corner. */
type ControlSpace = "none" | "one" | "two";

const CONTROL_PADDING: Record<ControlSpace, string> = {
  none: "",
  one: "pr-12",
  two: "pr-24",
};

const CLEAR_BUTTON =
  "text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:bg-destructive/10 motion-reduce:transition-none";

interface DayHeaderProps {
  slot: DaySlot;
  isToday: boolean;
  draggable: boolean;
  controls: ControlSpace;
}

function DayHeader({ slot, isToday, draggable, controls }: DayHeaderProps) {
  return (
    <span className={cn("flex min-w-0 flex-col gap-1", CONTROL_PADDING[controls])}>
      <span className="flex items-center gap-1 font-display text-2xl leading-tight font-extrabold tracking-tight break-words sm:text-3xl md:text-4xl">
        {draggable && <GripVertical className="-ml-1 size-5 shrink-0 text-muted-foreground" aria-hidden />}
        {slot.dayOfWeek}
        {isToday && <span aria-hidden className={TODAY_DOT} />}
      </span>
      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
        {formatShortDate(slot.date)}
        {isToday && <span className={pillSage}>Vandaag</span>}
      </span>
    </span>
  );
}

/**
 * Seven physical day tiles. Every scheduled dish has a remove button, in or out of edit mode.
 * Edit mode adds swapping a dish and dragging it to another day.
 */
export function WeekView({
  slots,
  todayKey,
  selectedDate,
  editMode,
  onOpenDish,
  onPick,
  onClear,
  onMove,
}: WeekViewProps) {
  const [draggingDate, setDraggingDate] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);

  const endDrag = () => {
    setDraggingDate(null);
    setOverDate(null);
  };

  const handleDragStart = (event: DragEvent<HTMLLIElement>, slot: DaySlot) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", slot.date);
    setDraggingDate(slot.date);
  };

  const handleDragOver = (event: DragEvent<HTMLLIElement>, slot: DaySlot) => {
    if (draggingDate === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overDate !== slot.date) setOverDate(slot.date);
  };

  const handleDragLeave = (event: DragEvent<HTMLLIElement>, slot: DaySlot) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    if (overDate === slot.date) setOverDate(null);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, slot: DaySlot) => {
    if (draggingDate === null) return;
    event.preventDefault();
    if (draggingDate !== slot.date) onMove(draggingDate, slot.date);
    endDrag();
  };

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) => {
        const { dish } = slot;
        const isToday = slot.date === todayKey;
        const isSelected = slot.date === selectedDate;
        const tileHighlight = cn(
          (isToday || isSelected) && LIFT,
          isToday && TODAY_BORDER,
          isSelected && !isToday && SELECTED_RING,
        );
        const canDrag = editMode && Boolean(dish);
        const dropTarget = draggingDate !== null && overDate === slot.date && draggingDate !== slot.date;

        return (
          <li
            key={slot.date}
            draggable={canDrag}
            onDragStart={canDrag ? (event) => handleDragStart(event, slot) : undefined}
            onDragEnd={endDrag}
            onDragOver={(event) => handleDragOver(event, slot)}
            onDragLeave={(event) => handleDragLeave(event, slot)}
            onDrop={(event) => handleDrop(event, slot)}
            className={cn(
              "relative min-h-56 rounded-3xl transition-transform duration-200 motion-reduce:transition-none",
              canDrag && "cursor-grab",
              draggingDate === slot.date && "opacity-50",
            )}
          >
            {dish ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenDish(slot)}
                  aria-label={`Bekijk ${dish.name} op ${slot.dayOfWeek}`}
                  className={cn(
                    neoCard,
                    "h-full min-h-56 justify-between",
                    tileHighlight,
                    dropTarget && DROP_TARGET,
                  )}
                >
                  <DayHeader
                    slot={slot}
                    isToday={isToday}
                    draggable={canDrag}
                    controls={editMode ? "two" : "one"}
                  />
                  <span className="flex items-center gap-3">
                    <DishImage src={dish.imageUrl} alt={dish.name} className="size-16 shrink-0" />
                    <span className="line-clamp-3 text-base leading-snug font-bold text-balance sm:text-lg">
                      {dish.name}
                    </span>
                  </span>
                  {slot.activeVariations.length > 0 && (
                    <span className="flex flex-wrap gap-1.5">
                      {slot.activeVariations.map((variation) => (
                        <span key={variation} className={pillInset}>
                          + {variation}
                        </span>
                      ))}
                    </span>
                  )}
                </button>

                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => onPick(slot.date)}
                      aria-label={`Wissel het gerecht van ${slot.dayOfWeek}`}
                      className={neoIconButton}
                    >
                      <ArrowLeftRight className="size-4" aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onClear(slot.date)}
                    aria-label={`Verwijder ${dish.name} van ${slot.dayOfWeek}`}
                    title="Verwijder uit de planning"
                    className={cn(neoIconButton, CLEAR_BUTTON)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </>
            ) : (
              <div
                className={cn(
                  "flex h-full min-h-56 flex-col justify-between gap-4 rounded-3xl bg-(--tactile-bg) p-4 tactile-raised",
                  tileHighlight,
                  dropTarget && DROP_TARGET,
                )}
              >
                <DayHeader slot={slot} isToday={isToday} draggable={false} controls="none" />
                <div className="flex flex-1 items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onPick(slot.date)}
                    aria-label={`Kies een gerecht voor ${slot.dayOfWeek}`}
                    className={cn(neoIconButton, "size-14")}
                  >
                    <Plus className="size-6" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}