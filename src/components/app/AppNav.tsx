"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { CalendarDays, ChefHat, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { DishyLogo } from "@/components/app/DishyLogo";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { EditModeSwitch } from "@/components/dishes/EditModeSwitch";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  /** Tooltip with the longer action name. */
  title?: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Weekplanner", Icon: CalendarDays },
  { href: "/gerechten", label: "Alle Gerechten", Icon: UtensilsCrossed },
  { href: "/configurator", label: "Configurator", title: "Nieuw gerecht bouwen", Icon: ChefHat },
];

const LINK =
  "relative inline-flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 font-display text-[length:clamp(0.68rem,3.3vw,0.875rem)] font-bold tracking-tight whitespace-nowrap transition-[color,transform] duration-150 select-none motion-reduce:transition-none active:scale-[0.97] sm:shrink-0 sm:flex-row sm:gap-2 sm:px-4 sm:py-2.5 sm:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [-webkit-tap-highlight-color:transparent]";

/** The sage thumb behind the active link. One element that slides, never remounted. */
const THUMB =
  "pointer-events-none absolute inset-y-1 left-0 rounded-xl [background:var(--sage-btn-bg)] shadow-[0_3px_8px_var(--tactile-shadow-soft),inset_0_1px_0_rgba(255,255,255,0.35)]";

/** Critically damped spring: smooth settle, no overshoot. A new target continues from the current value and velocity. */
const THUMB_SPRING = { type: "spring", bounce: 0, duration: 0.4 } as const;

/** The weekplanner lives at "/", so it only matches exactly. The other routes match by prefix. */
function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

interface Pending {
  href: string;
  /** The pathname the click happened on. Once the route changes, the pending state is ignored. */
  from: string;
}

/**
 * Sticky top bar: logo, page links, theme toggle and the global edit mode switch.
 * The links form a segmented control. The active link is marked right on click,
 * before the next page has loaded, and the raised thumb slides to it.
 * The thumb is placed with offsetLeft/offsetWidth, which ignore page scroll and transforms,
 * so the route change (which resets the scroll position) cannot make it jump.
 * On small screens the links wrap to their own row under the logo.
 */
export function AppNav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { editMode, setEditMode } = useApp();
  const [pending, setPending] = useState<Pending | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  /** Last position the thumb was sent to. left < 0 means it has not been placed yet. */
  const placed = useRef({ left: -1, width: -1 });

  const thumbX = useMotionValue(0);
  const thumbWidth = useMotionValue(0);
  const thumbOpacity = useMotionValue(0);

  const activeHref =
    pending && pending.from === pathname
      ? pending.href
      : (NAV_ITEMS.find((item) => isActive(pathname, item.href))?.href ?? null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const target = activeHref ? itemRefs.current[activeHref] : null;

    if (!nav || !target) {
      thumbOpacity.set(0);
      placed.current = { left: -1, width: -1 };
      return;
    }

    const place = (smooth: boolean) => {
      const left = target.offsetLeft;
      const width = target.offsetWidth;
      if (left === placed.current.left && width === placed.current.width) return;

      const hadPosition = placed.current.left >= 0;
      placed.current = { left, width };

      if (smooth && hadPosition && !reduceMotion) {
        animate(thumbX, left, THUMB_SPRING);
        animate(thumbWidth, width, THUMB_SPRING);
      } else {
        thumbX.stop();
        thumbWidth.stop();
        thumbX.set(left);
        thumbWidth.set(width);
      }
      thumbOpacity.set(1);
    };

    place(true);

    // Layout changes (font load, window resize) move the thumb instantly, without a spring.
    const observer = new ResizeObserver(() => place(false));
    observer.observe(nav);
    for (const element of Object.values(itemRefs.current)) {
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [activeHref, reduceMotion, thumbX, thumbWidth, thumbOpacity]);

  return (
    <header className="sticky top-0 z-40 bg-(--tactile-bg)/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Dishy, naar de weekplanner"
          onClick={() => setPending({ href: "/", from: pathname })}
          className="order-1 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <DishyLogo data-nav-logo className="text-2xl" />
        </Link>

        <nav
          ref={navRef}
          aria-label="Weergave"
          data-rise="1"
          className="tactile-sunken relative order-3 grid w-full grid-cols-3 items-stretch gap-1 rounded-2xl p-1 sm:flex sm:items-center lg:order-2 lg:w-auto"
        >
          <motion.span
            aria-hidden
            className={THUMB}
            style={{ x: thumbX, width: thumbWidth, opacity: thumbOpacity }}
          />
          {NAV_ITEMS.map(({ href, label, title, Icon }) => {
            const active = href === activeHref;
            return (
              <Link
                key={href}
                ref={(node) => {
                  itemRefs.current[href] = node;
                }}
                href={href}
                title={title}
                aria-current={active ? "page" : undefined}
                onClick={() => setPending({ href, from: pathname })}
                className={cn(
                  LINK,
                  active ? "text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div data-rise="2" className="order-2 ml-auto flex items-center gap-3 lg:order-3">
          <ThemeToggle />
          <EditModeSwitch checked={editMode} onCheckedChange={setEditMode} />
        </div>
      </div>
    </header>
  );
}