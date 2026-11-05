"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/* The resolved theme only exists in the browser. The server snapshot is false,
   so the first render matches the static HTML and hydration cannot mismatch. */
const subscribeNoop = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

/** Round tactile button that switches between the light and dark theme. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeNoop, getMounted, getServerMounted);
  const isDark = mounted && resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Schakel naar licht thema" : "Schakel naar donker thema"}
      className="tactile-btn inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}