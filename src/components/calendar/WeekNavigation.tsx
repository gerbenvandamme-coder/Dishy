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
  const buttonClass = (pressed: boolean) => cn(neoToggle(pressed, "sm"), "rounded-full px-4");

  return (
    <div
      role="group"
      aria-label="Week kiezen"
      className="inline-flex items-center gap-1.5 rounded-full bg-(--tactile-bg) p-1.5 tactile-raised"
    >
      <button type="button" onClick={() => onChange(weekOffset - 1)} className={buttonClass(false)}>
        <ChevronLeft className="size-4" aria-hidden />
        Vorige Week
      </button>
      <button
        type="button"
        aria-pressed={weekOffset === 0}
        onClick={() => onChange(0)}
        className={buttonClass(weekOffset === 0)}
      >
        Deze Week
      </button>
      <button type="button" onClick={() => onChange(weekOffset + 1)} className={buttonClass(false)}>
        Volgende Week
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}