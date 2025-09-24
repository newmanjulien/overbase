import {
  addDays,
  format,
  isAfter,
  isBefore,
  isToday,
  parse,
  startOfToday,
} from "date-fns";

export type DateKey = string; // "yyyy-MM-dd"

/** Normalize a Date → "yyyy-MM-dd" (local calendar date) */
export function toDateKey(d: Date): DateKey {
  return format(d, "yyyy-MM-dd");
}

/** Parse "yyyy-MM-dd" → Date (local midnight) */
export function fromDateKey(key: DateKey): Date {
  return parse(key, "yyyy-MM-dd", new Date());
}

/** Today helpers */
export const today = () => startOfToday();
export const isPastDate = (d: Date) => isBefore(d, startOfToday());
export const isFutureDate = (d: Date) => isAfter(d, startOfToday());
export const isTodayDate = (d: Date) => isToday(d);

/** Scheduling rule: minimum selectable date is N days from today (default: 2) */
export const minSelectableDate = (daysAhead = 2) =>
  addDays(startOfToday(), daysAhead);

/** Serialization helpers for Firestore / storage */
export const serializeScheduledDate = (d: Date): string => toDateKey(d);
export const deserializeScheduledDate = (s: string): Date => fromDateKey(s);
