"use client";

import { Check, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { neoButton, neoSection, pillInset } from "@/components/dishes/neo";
import type { ShoppingDepartment, ShoppingItem } from "@/components/calendar/colruytList";

interface ShoppingRowProps {
  item: ShoppingItem;
  checked: boolean;
  onToggle: () => void;
}

/** One ingredient. The checkbox presses down when checked. */
function ShoppingRow({ item, checked, onToggle }: ShoppingRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-xl bg-(--tactile-bg) p-3 text-left neo-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        checked ? "translate-y-0.5 tactile-sunken" : "tactile-raised",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg bg-(--tactile-bg)",
          checked ? "text-sage tactile-sunken" : "tactile-raised",
        )}
      >
        {checked && <Check className="size-4" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "text-sm font-medium",
            checked && "text-muted-foreground line-through decoration-1",
          )}
        >
          {item.name}
          {item.count > 1 && <span className="ml-1.5 font-semibold">×{item.count}</span>}
        </span>
        <span className="truncate text-xs text-muted-foreground">{item.dishNames.join(", ")}</span>
      </span>
    </button>
  );
}

interface ColruytSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** For example "Week 45 · 2 nov. t/m 8 nov. 2026". */
  weekLabel: string;
  departments: ShoppingDepartment[];
  checked: ReadonlySet<string>;
  onToggle: (key: string) => void;
  onReset: () => void;
}

/** Slide-out sheet with the combined ingredients of the week, grouped by department. */
export function ColruytSheet({
  open,
  onOpenChange,
  weekLabel,
  departments,
  checked,
  onToggle,
  onReset,
}: ColruytSheetProps) {
  const allItems = departments.flatMap((department) => department.items);
  const checkedCount = allItems.filter((item) => checked.has(item.key)).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-(--tactile-bg)">
        <SheetHeader className="px-5 pt-5 pr-14">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            Ingrediënten voor Colruyt Xtra
          </SheetTitle>
          <SheetDescription>{weekLabel}</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
          {allItems.length === 0 ? (
            <p className="rounded-2xl bg-(--tactile-bg) p-4 text-sm text-muted-foreground tactile-sunken">
              Er staan nog geen gerechten in deze week. Plan eerst een gerecht in, dan verschijnen
              de ingrediënten hier.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={pillInset} aria-live="polite">
                  {checkedCount} van {allItems.length} afgevinkt
                </span>
                {checkedCount > 0 && (
                  <button type="button" onClick={onReset} className={cn(neoButton, "px-3 py-1.5")}>
                    <RotateCcw className="size-4" aria-hidden />
                    Wis vinkjes
                  </button>
                )}
              </div>

              {departments.map((department) => {
                const headingId = `colruyt-${department.id}`;
                return (
                  <section
                    key={department.id}
                    aria-labelledby={headingId}
                    className={cn(neoSection, "flex flex-col gap-3")}
                  >
                    <h3 id={headingId} className="text-sm font-semibold">
                      {department.title}
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {department.items.map((item) => (
                        <li key={item.key}>
                          <ShoppingRow
                            item={item}
                            checked={checked.has(item.key)}
                            onToggle={() => onToggle(item.key)}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}