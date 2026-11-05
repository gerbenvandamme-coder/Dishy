"use client";

import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { neoButton } from "@/components/dishes/neo";

interface EditModeSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** Sunken neutral track while off. */
const TRACK_OFF =
  "bg-(--tactile-bg) shadow-[inset_3px_3px_6px_var(--tactile-shadow),inset_-3px_-3px_6px_var(--tactile-inset-highlight)]";

/** Rich sage track with a soft glow while on. */
const TRACK_ON =
  "bg-sage shadow-[inset_2px_2px_5px_var(--tactile-shadow),0_0_12px_var(--sage-border)]";

/**
 * Tactile rocker switch: a pencil icon and a sliding knob on a sunken track.
 * There is no visible label. The accessible name stays "Bewerkmodus" for screen readers.
 */
export function EditModeSwitch({ checked, onCheckedChange }: EditModeSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Bewerkmodus"
      onClick={() => onCheckedChange(!checked)}
      className={cn(neoButton, "gap-3 px-3.5")}
    >
      <Pencil
        className={cn(
          "size-4 transition-colors duration-200 motion-reduce:transition-none",
          checked ? "text-sage" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none",
          checked ? TRACK_ON : TRACK_OFF,
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full shadow-[2px_2px_4px_var(--tactile-shadow),-1px_-1px_3px_var(--tactile-highlight)] transition-transform duration-200 motion-reduce:transition-none",
            checked ? "translate-x-5 bg-white" : "bg-(--tactile-bg)",
          )}
        />
      </span>
    </button>
  );
}