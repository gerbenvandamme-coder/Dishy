"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { neoToggle } from "@/components/dishes/neo";

interface WeekNavigationProps {
  /** 0 is the current week, negative values are past weeks. */
  weekOffset: number;
  onChange: (weekOffset: number) => void;
}

/** Pill-shaped button group: previous week, this week, next week. */
export function WeekNavigation({ weekOffset, onChange }: WeekNavigationProps) {
  const buttonClass = (pressed: boolean) =>
    cn(neoToggle(pressed, "sm"), "justify-center rounded-full px-3 whitespace-nowrap sm:px-4");

  return (
    <div
      role="group"
      aria-label="Week kiezen"
      className="grid grid-cols-3 items-center gap-1.5 rounded-full bg-(--tactile-bg) p-1.5 tactile-raised sm:inline-flex sm:self-start"
    >
      <button type="button" onClick={() => onChange(weekOffset - 1)} className={buttonClass(false)}>
        <ChevronLeft className="size-4" aria-hidden />
        Vorige<span className="max-sm:sr-only"> Week</span>
      </button>
      <button
        type="button"
        aria-pressed={weekOffset === 0}
        onClick={() => onChange(0)}
        className={buttonClass(weekOffset === 0)}
      >
        Deze<span className="max-sm:sr-only"> Week</span>
      </button>
      <button type="button" onClick={() => onChange(weekOffset + 1)} className={buttonClass(false)}>
        Volgende<span className="max-sm:sr-only"> Week</span>
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}