"use client";

import { useState, type DragEvent } from "react";
import { ArrowLeftRight, CalendarPlus, GripVertical, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import type { Dish } from "@/types/dish";
import { cn } from "@/lib/utils";
import { DishImage } from "@/components/dishes/DishImage";
import { neoCard, neoIconButton, pillInset, pillOneOff, pillToday } from "@/components/dishes/neo";
import { formatShortDate } from "@/components/calendar/weekUtils";

export interface DaySlot {
  date: string;
  dayOfWeek: string;
  dish?: Dish;
  /** True when the dish was composed for this day only and is not in the library. */
  isOneOff: boolean;
  activeVariations: string[];
}

interface WeekViewProps {
  slots: DaySlot[];
  todayKey: string;
  /** The day whose dish is open in the detail modal. */
  selectedDate: string | null;
  /** Unlocks choosing another dish and dragging. Removing a dish never needs it. */
  editMode: boolean;
  /** Swap mode: tapping a day picks a dish up, tapping another day puts it down (or swaps). */
  swapMode: boolean;
  /** The day whose dish is picked up in swap mode. */
  swapSource: string | null;
  onOpenDish: (slot: DaySlot) => void;
  /** Assign mode: the dish from the configurator that still needs a day. Every tile becomes a target. */
  assignDish: Dish | null;
  onPick: (date: string) => void;
  onClear: (date: string) => void;
  onMove: (from: string, to: string) => void;
  onSwapSelect: (date: string) => void;
  onAssign: (date: string) => void;
}

/** Today sits slightly higher than the other tiles and gets a sage ring. */
const TODAY_TILE = "-translate-y-1 ring-2 ring-sage";

/** The tile picked up in swap mode. */
const SOURCE_TILE = "ring-4 ring-sage -translate-y-1";

/** The detail modal is open for this tile. */
const SELECTED_RING = "ring-2 ring-sage/70";

/** Every tile outlined while a mode (swap or assign) is on, so the screen clearly reads as "in a mode". */
const MODE_TILE = "outline-2 outline-offset-2 outline-dashed outline-sage/50";

const DROP_TARGET = "outline-2 outline-offset-2 outline-dashed outline-sage";

const CLEAR_BUTTON =
  "text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:bg-destructive/10 motion-reduce:transition-none";

/** Keeps the day title clear of the round buttons in the tile's top-right corner. */
type ControlSpace = "none" | "one" | "two";

/* On a phone the tile is a compact row (photo left, text right) and the buttons sit at the right
   edge of the whole tile. From sm up the tile is tall and the buttons only overlap the header. */
const CONTROL_PADDING: Record<ControlSpace, string> = {
  none: "",
  one: "sm:pr-16",
  two: "sm:pr-28",
};

const TILE_CONTROL_PADDING: Record<ControlSpace, string> = {
  none: "",
  one: "max-sm:pr-16",
  two: "max-sm:pr-28",
};

/** Phone layout of a tile: a two-column grid with the photo spanning the rows on the left. */
const COMPACT_TILE =
  "max-sm:grid max-sm:grid-cols-[4.5rem_minmax(0,1fr)] max-sm:content-center max-sm:items-center max-sm:gap-x-3 max-sm:gap-y-1 max-sm:p-3";

/** Everything except the photo goes in the right column of the phone layout. */
const RIGHT_COLUMN = "max-sm:col-start-2";

interface DayHeaderProps {
  slot: DaySlot;
  isToday: boolean;
  draggable: boolean;
  controls: ControlSpace;
}

function DayHeader({ slot, isToday, draggable, controls }: DayHeaderProps) {
  return (
    <span
      className={cn(
        "flex min-w-0 flex-col gap-1 max-sm:flex-row max-sm:flex-wrap max-sm:items-center max-sm:gap-x-2 max-sm:gap-y-0.5",
        RIGHT_COLUMN,
        CONTROL_PADDING[controls],
      )}
    >
      <span className="flex items-center gap-1 font-display text-lg leading-tight font-extrabold tracking-tight sm:text-2xl">
        {draggable && <GripVertical className="-ml-1 size-5 shrink-0 text-muted-foreground" aria-hidden />}
        {slot.dayOfWeek}
      </span>
      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
        {formatShortDate(slot.date)}
        {isToday && <span className={pillToday}>Vandaag</span>}
      </span>
    </span>
  );
}

interface DishSummaryProps {
  slot: DaySlot;
  dish: Dish;
  /** Rows the photo spans in the phone layout: header and title, plus the hint in a mode. */
  photoRows: 2 | 3;
}

/** Photo, title and the small tags under it. Shared by the normal and the swap-mode tile. */
function DishSummary({ slot, dish, photoRows }: DishSummaryProps) {
  return (
    <>
      <DishImage
        src={dish.imageUrl}
        alt={dish.name}
        width={420}
        className={cn(
          "aspect-[16/10] w-full max-sm:col-start-1 max-sm:row-start-1 max-sm:aspect-square max-sm:p-1",
          photoRows === 3 ? "max-sm:row-span-3" : "max-sm:row-span-2",
        )}
      />
      <span className={cn("flex min-w-0 flex-col gap-2 max-sm:gap-1", RIGHT_COLUMN)}>
        <span className="line-clamp-2 text-base leading-snug font-bold text-balance sm:text-lg">
          {dish.name}
        </span>
        {(slot.isOneOff || slot.activeVariations.length > 0) && (
          <span className="flex flex-wrap gap-1.5">
            {slot.isOneOff && (
              <span className={pillOneOff}>
                <Sparkles className="size-3.5" aria-hidden />
                Eenmalig
              </span>
            )}
            {slot.activeVariations.map((variation) => (
              <span key={variation} className={pillInset}>
                + {variation}
              </span>
            ))}
          </span>
        )}
      </span>
    </>
  );
}

/**
 * Seven physical day tiles. Every scheduled dish has a remove button, in or out of edit mode.
 * Edit mode adds choosing another dish and dragging it to another day.
 * Swap mode turns every tile into a target: tap one dish, tap another day, done.
 */
export function WeekView({
  slots,
  todayKey,
  selectedDate,
  editMode,
  swapMode,
  swapSource,
  onOpenDish,
  assignDish,
  onPick,
  onClear,
  onMove,
  onSwapSelect,
  onAssign,
}: WeekViewProps) {
  const [draggingDate, setDraggingDate] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);

  const assignMode = assignDish !== null;
  const targetMode = swapMode || assignMode;
  const dragEnabled = !assignMode && (editMode || swapMode);

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
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {slots.map((slot) => {
        const { dish } = slot;
        const isToday = slot.date === todayKey;
        const isSelected = slot.date === selectedDate;
        const isSource = swapMode && slot.date === swapSource;
        const tileHighlight = cn(
          isToday && !isSource && TODAY_TILE,
          isSource && SOURCE_TILE,
          isSelected && !isToday && !isSource && SELECTED_RING,
          targetMode && !isSource && !(draggingDate !== null && overDate === slot.date) && MODE_TILE,
        );
        const canDrag = dragEnabled && Boolean(dish);
        const dropTarget = draggingDate !== null && overDate === slot.date && draggingDate !== slot.date;

        /** What a tap on this tile does in swap mode, spelled out on the tile itself. */
        let swapHint = "Tik om te kiezen";
        if (assignMode) {
          swapHint = dish ? "Tik om te vervangen" : "Tik om hier te zetten";
        } else if (swapSource !== null) {
          if (isSource) swapHint = "Geselecteerd, tik om te annuleren";
          else swapHint = dish ? "Tik om te wisselen" : "Tik om hierheen te zetten";
        } else if (!dish) {
          swapHint = "Geen gerecht om te verplaatsen";
        }

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
              "relative rounded-3xl transition-transform sm:min-h-64 duration-200 motion-reduce:transition-none",
              canDrag && "cursor-grab",
              draggingDate === slot.date && "opacity-50",
            )}
          >
            {targetMode ? (
              <button
                type="button"
                onClick={() => (assignMode ? onAssign(slot.date) : onSwapSelect(slot.date))}
                disabled={!assignMode && swapSource === null && !dish}
                aria-pressed={assignMode ? undefined : isSource}
                aria-label={
                  dish
                    ? `${slot.dayOfWeek}: ${dish.name}. ${swapHint}`
                    : `${slot.dayOfWeek}: leeg. ${swapHint}`
                }
                className={cn(
                  neoCard,
                  COMPACT_TILE,
                  "h-full justify-between disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-64",
                  !dish && "border-2! border-dashed! border-sage-border!",
                  tileHighlight,
                  dropTarget && DROP_TARGET,
                )}
              >
                <DayHeader slot={slot} isToday={isToday} draggable={false} controls="none" />
                {dish ? (
                  <DishSummary slot={slot} dish={dish} photoRows={3} />
                ) : (
                  <span className="flex flex-1 items-center justify-center text-sm text-muted-foreground max-sm:col-start-1 max-sm:row-span-3 max-sm:row-start-1 max-sm:aspect-square max-sm:rounded-2xl max-sm:border-2 max-sm:border-dashed max-sm:border-sage-border">
                    Leeg
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
                    "max-sm:min-h-0 max-sm:justify-self-start max-sm:px-2.5 max-sm:py-1 max-sm:text-xs",
                    RIGHT_COLUMN,
                    isSource || (assignMode && !dish)
                      ? "bg-sage text-white dark:text-[#0f1311]"
                      : "bg-sage-tint text-sage-ink",
                  )}
                >
                  {assignMode ? (
                    <CalendarPlus className="size-4" aria-hidden />
                  ) : (
                    <ArrowLeftRight className="size-4" aria-hidden />
                  )}
                  {swapHint}
                </span>
              </button>
            ) : dish ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenDish(slot)}
                  aria-label={`Bekijk ${dish.name} op ${slot.dayOfWeek}`}
                  className={cn(
                    neoCard,
                    COMPACT_TILE,
                    TILE_CONTROL_PADDING[editMode ? "two" : "one"],
                    "h-full justify-between sm:min-h-64",
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
                  <DishSummary slot={slot} dish={dish} photoRows={2} />
                </button>

                <div className="absolute top-3 right-3 z-10 flex gap-2 max-sm:top-1/2 max-sm:-translate-y-1/2">
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => onPick(slot.date)}
                      aria-label={`Kies een ander gerecht voor ${slot.dayOfWeek}`}
                      title="Kies een ander gerecht"
                      className={neoIconButton}
                    >
                      <Pencil className="size-4" aria-hidden />
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
                  "flex h-full flex-col justify-between gap-4 rounded-3xl border-2 border-dashed border-sage-border bg-(--tactile-bg) p-4 sm:min-h-64 max-sm:flex-row max-sm:items-center max-sm:p-3",
                  tileHighlight,
                  dropTarget && DROP_TARGET,
                )}
              >
                <DayHeader slot={slot} isToday={isToday} draggable={false} controls="none" />
                <div className="flex flex-1 items-center justify-center max-sm:flex-none">
                  <button
                    type="button"
                    onClick={() => onPick(slot.date)}
                    aria-label={`Kies een gerecht voor ${slot.dayOfWeek}`}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-(--tactile-bg) px-4 py-3 text-sm font-semibold text-sage-ink tactile-btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <Plus className="size-5" aria-hidden />
                    Gerecht toevoegen
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
