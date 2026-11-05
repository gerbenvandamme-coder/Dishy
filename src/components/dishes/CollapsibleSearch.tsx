"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tailwind's `sm` breakpoint. Below it the search collapses into a round icon button. */
const DESKTOP_QUERY = "(min-width: 640px)";

function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const getDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
const getServerDesktop = () => false;

/**
 * Classes for the header content next to the search. On mobile it condenses to
 * nothing and fades out while the search is open, so the search grows into the
 * freed space instead of pushing the layout around.
 */
export function searchSiblingClass(expanded: boolean): string {
  return cn(
    "min-w-0 overflow-hidden whitespace-nowrap max-sm:mr-3 max-sm:max-w-[20rem]",
    "motion-safe:transition-[max-width,margin,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)]",
    expanded && "max-sm:mr-0 max-sm:max-w-0 max-sm:opacity-0",
  );
}

interface CollapsibleSearchProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name and placeholder. */
  label: string;
  /** Lets the parent condense its neighbouring header content while the search is open on mobile. */
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

/**
 * Search field that is always visible from the `sm` breakpoint up. On mobile it is a
 * round magnifier button that grows to the left when tapped. Tapping outside, pressing
 * Escape or pressing the clear button collapses it again.
 */
export function CollapsibleSearch({
  value,
  onChange,
  label,
  onExpandedChange,
  className,
}: CollapsibleSearchProps) {
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktop, getServerDesktop);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      setExpanded(next);
      onExpandedChange?.(next);
    },
    [onExpandedChange],
  );

  useEffect(() => {
    if (!expanded) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, setOpen]);

  const open = isDesktop || expanded;
  const showClear = open && (value !== "" || !isDesktop);

  const expand = () => {
    if (!isDesktop) setOpen(true);
    // Focus inside the tap handler so mobile browsers open the keyboard.
    inputRef.current?.focus({ preventScroll: true });
  };

  const clear = () => {
    onChange("");
    if (isDesktop) inputRef.current?.focus({ preventScroll: true });
    else setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      role="search"
      className={cn("relative h-11 min-w-11 flex-1 sm:w-72 sm:flex-none", className)}
    >
      <div
        className={cn(
          "absolute top-0 right-0 z-10 flex h-11 items-center overflow-hidden rounded-full bg-(--tactile-bg) tactile-sunken",
          "motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)]",
          "sm:w-full",
          open ? "w-full" : "w-11",
        )}
      >
        <button
          type="button"
          onClick={expand}
          aria-label={label}
          aria-expanded={open}
          tabIndex={open ? -1 : 0}
          className="absolute top-0 left-0 grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:scale-95"
        >
          <Search className="size-4" aria-hidden />
          {value !== "" && !open && (
            <span
              aria-hidden
              className="absolute top-2.5 right-2.5 size-2 rounded-full bg-primary"
            />
          )}
        </button>

        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label}
          aria-label={label}
          maxLength={80}
          tabIndex={open ? 0 : -1}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent pr-2 pl-11 text-base outline-none placeholder:text-muted-foreground sm:text-sm",
            !open && "max-sm:pointer-events-none max-sm:opacity-0",
          )}
        />

        {showClear && (
          <button
            type="button"
            onClick={clear}
            aria-label="Zoekopdracht wissen"
            className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:scale-95"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}