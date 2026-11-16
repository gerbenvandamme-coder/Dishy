"use client";

import type { ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { neoButton } from "@/components/dishes/neo";

interface ModeBarProps {
  Icon: LucideIcon;
  /** Short name of the mode, for example "Toewijzingsmodus". */
  title: string;
  /** What to do next. Changes while the user moves through the mode. */
  children: ReactNode;
  /** Label of the button that leaves the mode. */
  exitLabel: string;
  onExit: () => void;
}

/**
 * Fixed bar at the bottom of the screen that tells the user a mode is active (assigning a dish,
 * swapping days) and always offers the way out. It sits where the thumb is, so on a phone
 * nothing needs scrolling, and it respects the iPhone home indicator.
 */
export function ModeBar({ Icon, title, children, exitLabel, onExit }: ModeBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
    >
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-3 rounded-3xl border-2 border-sage bg-(--tactile-bg) p-2.5 sm:p-3 shadow-[0_10px_30px_var(--tactile-shadow),0_2px_6px_var(--tactile-shadow),0_0_0_4px_var(--sage-tint)]">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center max-[380px]:hidden sm:size-11 rounded-2xl bg-sage text-white dark:text-[#0f1311]"
        >
          <Icon className="size-5" />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-snug text-foreground">
          <strong className="block font-display text-sm font-extrabold sm:text-base">{title}</strong>
          {children}
        </p>
        <button type="button" onClick={onExit} className={neoButton}>
          <X className="size-4" aria-hidden />
          {exitLabel}
        </button>
      </div>
    </div>
  );
}
