/**
 * Class strings for the larger tactile controls of the configurator.
 * They are written out in full so Tailwind can detect them.
 */

const SURFACE = "bg-(--tactile-bg)";
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** The wide button that opens the template wizard. */
export const wizardTrigger = `${SURFACE} ${FOCUS} flex w-full cursor-pointer items-center gap-4 rounded-3xl p-4 text-left text-foreground tactile-btn sm:p-5`;

/** The main call to action, bigger than neoButton. */
export const primaryButton = `${FOCUS} inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-3xl px-6 py-4 font-display text-base font-extrabold text-white tactile-btn-sage disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:text-lg`;