/**
 * Remembers that the splash was dismissed, for the lifetime of the page only.
 * It lives in module scope instead of storage: a reload resets it, so the splash
 * shows on every load or refresh, while client-side navigation
 * (for example /configurator -> /) does not replay it.
 */
let entered = false;

export function hasEnteredThisSession(): boolean {
  return entered;
}

export function markEntered(): void {
  entered = true;
}