"use client";

import { LayoutGrid, List, type LucideIcon } from "lucide-react";
import { neoToggle } from "@/components/dishes/neo";
import type { DishView } from "@/components/dishes/useDishView";

interface ViewOption {
  value: DishView;
  label: string;
  Icon: LucideIcon;
}

const OPTIONS: readonly ViewOption[] = [
  { value: "cards", label: "Kaarten", Icon: LayoutGrid },
  { value: "list", label: "Lijst", Icon: List },
];

interface ViewToggleProps {
  view: DishView;
  onChange: (view: DishView) => void;
}

/** Two toggle buttons to switch between the card grid and the compact list. The active one is sage. */
export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div role="group" aria-label="Weergave van gerechten" className="inline-flex items-center gap-2">
      {OPTIONS.map(({ value, label, Icon }) => {
        const pressed = view === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(value)}
            className={neoToggle(pressed, "sm")}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}