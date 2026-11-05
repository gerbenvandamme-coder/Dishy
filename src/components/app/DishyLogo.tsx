import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface DishyLogoProps extends ComponentProps<"span"> {
  /** Classes for the dot after the word. Defaults to the sage accent. */
  dotClassName?: string;
}

/**
 * The "Dishy." wordmark. The dot is sized in em, so the whole mark scales with font-size alone.
 * The top bar and the splash screen both render it, which lets the splash logo fly into the bar
 * and land exactly on top of the real one.
 */
export function DishyLogo({ className, dotClassName = "bg-sage", ...props }: DishyLogoProps) {
  return (
    <span
      className={cn("inline-block font-display font-black tracking-tight", className)}
      {...props}
    >
      Dishy
      <span
        aria-hidden
        className={cn("ml-[0.08em] inline-block size-[0.25em] rounded-full", dotClassName)}
      />
    </span>
  );
}