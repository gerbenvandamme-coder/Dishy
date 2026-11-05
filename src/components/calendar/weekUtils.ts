/** Date helpers for the planner. Dates are local "YYYY-MM-DD" keys, weeks start on Monday. */

export const DAY_NAMES = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
] as const;

const DAYS_PER_WEEK = 7;
const MS_PER_WEEK = DAYS_PER_WEEK * 24 * 60 * 60 * 1000;

export interface WeekDay {
  date: string;
  dayOfWeek: string;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses a key at noon local time, so daylight saving changes never shift the day. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Index of the weekday with Monday = 0. */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % DAYS_PER_WEEK;
}

export function dayNameOf(key: string): string {
  return DAY_NAMES[mondayIndex(fromDateKey(key))];
}

export function startOfWeek(key: string): string {
  return addDays(key, -mondayIndex(fromDateKey(key)));
}

export function getWeekDays(weekStart: string): WeekDay[] {
  return DAY_NAMES.map((dayOfWeek, index) => ({ date: addDays(weekStart, index), dayOfWeek }));
}

/** ISO 8601 week number (the week containing the first Thursday is week 1). */
export function isoWeekNumber(key: string): number {
  const thursday = fromDateKey(key);
  thursday.setDate(thursday.getDate() - mondayIndex(thursday) + 3);

  const firstThursday = new Date(thursday.getFullYear(), 0, 4, 12);
  firstThursday.setDate(firstThursday.getDate() - mondayIndex(firstThursday) + 3);

  return 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / MS_PER_WEEK);
}

export function formatShortDate(key: string): string {
  return new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "short" }).format(
    fromDateKey(key),
  );
}

/** For example "2 nov. t/m 8 nov. 2026". */
export function formatWeekRange(weekStart: string): string {
  const end = addDays(weekStart, DAYS_PER_WEEK - 1);
  return `${formatShortDate(weekStart)} t/m ${formatShortDate(end)} ${fromDateKey(end).getFullYear()}`;
}

/** Describes a week relative to the current one. */
export function relativeWeekLabel(offset: number): string {
  if (offset === 0) return "Deze week";
  if (offset === -1) return "Vorige week";
  if (offset === 1) return "Volgende week";
  return offset < 0 ? `${-offset} weken geleden` : `Over ${offset} weken`;
}

/** Whole weeks from the week containing `from` to the week containing `to`. Negative when `to` is earlier. */
export function weeksBetween(from: string, to: string): number {
  const diff = fromDateKey(startOfWeek(to)).getTime() - fromDateKey(startOfWeek(from)).getTime();
  return Math.round(diff / MS_PER_WEEK);
}