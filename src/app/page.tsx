"use client";

import { useState } from "react";
import { SplashHero } from "@/components/SplashHero";
import { WeekPlanner } from "@/components/calendar/WeekPlanner";
import { hasEnteredThisSession, markEntered } from "@/lib/entry";

export default function HomePage() {
  // False on every full load or refresh, so the splash always shows.
  // Coming back from another route keeps it dismissed (see src/lib/entry.ts).
  const [hasEntered, setHasEntered] = useState(hasEnteredThisSession);

  const handleEnter = () => {
    markEntered();
    setHasEntered(true);
  };

  return (
    <>
      {!hasEntered && <SplashHero onEnter={handleEnter} />}

      {/* Rendered under the splash, so the plan is already loaded when the page shoots up.
          data-rise="3" is animated by the opening sequence in globals.css. */}
      <div data-rise="3" className="flex flex-1 flex-col">
        <WeekPlanner />
      </div>
    </>
  );
}