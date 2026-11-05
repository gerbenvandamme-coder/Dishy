"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Distance in px a page rises while it fades in after a tab switch. */
const PAGE_OFFSET_PX = 10;

/**
 * A template remounts on every navigation while the layout (and the nav bar in it) stays mounted.
 * That gives each page a short fade-and-rise entrance without touching the top bar.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : PAGE_OFFSET_PX }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}