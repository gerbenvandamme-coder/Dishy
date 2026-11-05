/**
 * Shared Tailwind class strings for the neo-skeuomorphic look.
 * Every class name is written out in full so Tailwind can detect it.
 * The neo-* utilities are defined in src/app/globals.css.
 */

const SURFACE = "bg-(--tactile-bg)";
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Surface of every dialog: a raised slab. */
export const dialogSurface = `${SURFACE} w-full gap-6 rounded-3xl p-5 ring-0 neo-raised sm:p-7`;

/** A sunken section (ingredient group, tray compartment). */
export const neoSection = `${SURFACE} rounded-2xl p-4 neo-inset`;

/** Raised dish card. It sinks on press. */
export const neoCard = `${SURFACE} ${FOCUS} flex w-full cursor-pointer flex-col gap-4 rounded-3xl p-4 text-left tactile-raised neo-press active:tactile-sunken active:translate-y-0.5`;

/** Raised button. It sinks on press. */
export const neoButton = `${SURFACE} ${FOCUS} inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground tactile-btn disabled:pointer-events-none disabled:opacity-50`;

/** Small round raised button (edit badges, add buttons). */
export const neoIconButton = `${SURFACE} ${FOCUS} inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground transition-all duration-150 shadow-[2px_2px_5px_var(--tactile-shadow-soft),-2px_-2px_5px_var(--tactile-highlight)] active:translate-y-0.5 active:shadow-[inset_2px_2px_4px_var(--tactile-shadow-soft),inset_-2px_-2px_4px_var(--tactile-inset-highlight)] disabled:pointer-events-none disabled:opacity-40`;

/** Debossed well for inputs and textareas. */
export const neoWell = `${SURFACE} ${FOCUS} w-full rounded-xl px-3 py-2 text-sm text-foreground neo-inset placeholder:text-muted-foreground aria-invalid:outline-2 aria-invalid:outline-destructive`;

/** Extruded pill token. */
export const pillRaised = `${SURFACE} inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-foreground shadow-[2px_2px_5px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.45),-2px_-2px_4px_rgba(255,255,255,0.04)]`;

/** Soft debossed tag. */
export const pillInset = `${SURFACE} inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.04)]`;

const TOGGLE_BASE = `${FOCUS} inline-flex cursor-pointer items-center gap-2 rounded-2xl neo-press`;

/** Soft debossed sage well for a selected toggle. */
const TOGGLE_SELECTED =
  "bg-[#557A61]/15 text-[#35523E] dark:text-[#94B8A0] border border-[#557A61]/30 shadow-inner font-bold";

/** Sage-tinted pill token (accent badges). */
export const pillSage = `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${TOGGLE_SELECTED}`;

/** Primary sage button (save, confirm). It sinks on press. */
export const sageButton = `${FOCUS} inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#557A61] px-4 py-2.5 text-sm font-semibold text-white shadow-[2px_2px_5px_rgba(0,0,0,0.15),-2px_-2px_5px_rgba(255,255,255,0.6)] transition-all duration-150 hover:bg-[#4a6b55] active:translate-y-0.5 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.25)] disabled:pointer-events-none disabled:opacity-50 dark:shadow-[2px_2px_5px_rgba(0,0,0,0.45),-2px_-2px_4px_rgba(255,255,255,0.04)]`;

/** One full-width raised row in the dish list. It sinks on press. */
export const neoListRow = `${SURFACE} ${FOCUS} flex min-w-0 flex-1 cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl px-4 py-3 text-left neo-raised neo-press active:neo-inset active:translate-y-0.5`;

/** Toggle button. When pressed it clicks into a sunken state. */
export function neoToggle(pressed: boolean, size: "md" | "sm" = "md"): string {
  const padding = size === "md" ? "px-4 py-2.5 text-sm" : "px-3 py-1.5 text-sm";
  return pressed
    ? `${TOGGLE_BASE} ${padding} font-semibold neo-inset translate-y-0.5`
    : `${TOGGLE_BASE} ${padding} font-medium neo-raised active:neo-inset active:translate-y-0.5`;
}