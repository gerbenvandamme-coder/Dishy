"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DishyLogo } from "@/components/app/DishyLogo";
import { cn } from "@/lib/utils";

type Bezier = [number, number, number, number];

/** Press pose of the key. It sinks 6px, matching the 8px lower edge that shrinks in globals.css. */
const PRESSED = { scale: 0.98, y: 6 };
const RESTING = { scale: 1, y: 0 };
const PRESS_SPRING = { type: "spring", stiffness: 520, damping: 32, mass: 0.7 } as const;

/** The logo first zooms in to this scale, then travels to the top bar. */
const ZOOM_SCALE = 1.22;
/** Share of the flight spent on the zoom before the logo starts to travel. */
const ZOOM_SHARE = 0.27;
const FLIGHT_S = 1;
const ZOOM_EASE: Bezier = [0.22, 1, 0.36, 1];
const FLY_EASE: Bezier = [0.6, 0, 0.15, 1];

/**
 * Time from the click until the last rising element has settled.
 * It must stay above the longest delay plus duration of [data-rise] in globals.css (0.32s + 0.9s).
 */
const SETTLE_MS = 1300;
/** Fade length when the user prefers reduced motion. */
const REDUCED_S = 0.2;

interface Flight {
  x: number;
  y: number;
  scale: number;
}

interface SplashHeroProps {
  /** Called once the opening sequence has finished. */
  onEnter: () => void;
}

/**
 * Measures how far the splash logo has to travel, and how much it has to shrink,
 * to sit exactly on the logo in the top bar. Returns null when the bar logo is not on the page.
 */
function measureFlight(anchor: HTMLElement | null, logo: HTMLElement | null): Flight | null {
  const target = document.querySelector<HTMLElement>("[data-nav-logo]");
  if (!anchor || !logo || !target || logo.offsetWidth === 0) return null;
  // The anchor is never transformed, so its centre is where the logo rests, even mid-press.
  const from = anchor.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
    scale: to.width / logo.offsetWidth,
  };
}

/**
 * Full-screen entry splash, shown on every load.
 * A sage key carries the "Dishy." logo. Pressing it sinks the key, zooms the logo in briefly,
 * then flies the logo into the top bar while the rest of the site shoots up (see data-rise).
 */
export function SplashHero({ onEnter }: SplashHeroProps) {
  const reduceMotion = useReducedMotion();
  const [down, setDown] = useState(false);
  const [opening, setOpening] = useState(false);
  const [flight, setFlight] = useState<Flight | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // While the splash is mounted the bar logo stays hidden (see globals.css).
  // Cleanup runs in the same commit that removes the splash, so the bar logo appears on that frame.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.splash = "idle";
    return () => {
      delete root.dataset.splash;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    const nextFlight = reduceMotion ? null : measureFlight(anchorRef.current, logoRef.current);
    if (nextFlight) {
      setFlight(nextFlight);
      document.documentElement.dataset.splash = "opening";
    }
    timer.current = setTimeout(onEnter, nextFlight ? SETTLE_MS : REDUCED_S * 1000);
  };

  const pressed = down || opening;

  const logoAnimate = flight
    ? {
        x: [0, 0, flight.x],
        y: [null, 0, flight.y],
        scale: [null, ZOOM_SCALE, flight.scale],
      }
    : opening
      ? { opacity: 0 }
      : pressed
        ? PRESSED
        : RESTING;

  const logoTransition = flight
    ? { duration: FLIGHT_S, times: [0, ZOOM_SHARE, 1], ease: [ZOOM_EASE, FLY_EASE] }
    : opening
      ? { duration: REDUCED_S }
      : PRESS_SPRING;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden px-6 sm:gap-10",
        opening && "pointer-events-none",
      )}
    >
      <motion.div
        aria-hidden
        className="neo-surface absolute inset-0"
        initial={false}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={
          reduceMotion
            ? { duration: REDUCED_S }
            : { duration: 0.6, delay: 0.22, ease: "easeOut" }
        }
      />

      <div className="relative aspect-square w-[min(78vw,46svh,360px)]">
        <motion.div
          className="tactile-sunken absolute inset-0 rounded-full p-[6%]"
          initial={false}
          animate={
            opening
              ? { opacity: 0, scale: reduceMotion ? 1 : 0.88 }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: reduceMotion ? REDUCED_S : 0.4, ease: "easeOut" }}
        >
          <motion.button
            type="button"
            aria-label="Klik om te openen"
            data-down={pressed}
            onClick={handleClick}
            onPointerDown={() => setDown(true)}
            onPointerUp={() => setDown(false)}
            onPointerLeave={() => setDown(false)}
            onPointerCancel={() => setDown(false)}
            animate={pressed ? PRESSED : RESTING}
            transition={PRESS_SPRING}
            className="sage-key h-full w-full cursor-pointer touch-manipulation rounded-full select-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ring [-webkit-tap-highlight-color:transparent]"
          />
        </motion.div>

        {/* The logo is a sibling of the key, so it can leave the key while the key fades away. */}
        <div
          ref={anchorRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <motion.div
            ref={logoRef}
            animate={logoAnimate}
            transition={logoTransition}
          >
            <DishyLogo
              className={cn(
                "text-[clamp(3rem,16vw,6.5rem)] transition-[color,text-shadow] duration-700 ease-out",
                opening
                  ? "text-foreground [text-shadow:none]"
                  : "text-white [text-shadow:0_-1px_0_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.2)]",
              )}
              dotClassName={cn(
                "transition-colors duration-700 ease-out",
                opening ? "bg-sage" : "bg-white",
              )}
            />
          </motion.div>
        </div>
      </div>

      <motion.p
        className="relative font-display text-sm font-extrabold tracking-[0.32em] text-muted-foreground sm:text-base"
        animate={
          opening
            ? { opacity: 0, y: 12 }
            : reduceMotion
              ? { opacity: 0.7 }
              : { opacity: [0.35, 0.85, 0.35] }
        }
        transition={
          opening
            ? { duration: 0.25 }
            : reduceMotion
              ? undefined
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        KLIK OM TE OPENEN
      </motion.p>
    </div>
  );
}