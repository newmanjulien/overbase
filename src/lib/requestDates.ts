import {
  addDays,
  format,
  formatISO,
  isAfter,
  isBefore,
  isToday,
  parse,
  startOfToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";

export const isBeforeDate = (a: Date, b: Date) => isBefore(a, b);

export type DateKey = string & { __brand: "DateKey" };
const DATE_KEY_FORMAT = "yyyy-MM-dd";

/** Normalize a Date → "yyyy-MM-dd" (local calendar date) */
export function toDateKey(d: Date): DateKey {
  return format(d, DATE_KEY_FORMAT) as DateKey;
}

/** Parse "yyyy-MM-dd" → Date (local midnight) */
export function fromDateKey(key: DateKey): Date {
  return parse(key, DATE_KEY_FORMAT, new Date());
}

/** Today helpers */
export const today = () => startOfToday();
export const isPastDate = (d: Date) => isBefore(d, today());
export const isFutureDate = (d: Date) => isAfter(d, today());
export const isTodayDate = (d: Date) => isToday(d);

/** Scheduling rule: minimum selectable date is N days from today (default: 2) */
export const minSelectableDate = (daysAhead = 2) => addDays(today(), daysAhead);

/** Serialization helpers for Firestore / storage */
export const serializeScheduledDate = (d: Date): DateKey => toDateKey(d);
export const deserializeScheduledDate = (s: string): Date =>
  fromDateKey(s as DateKey);

/** Display formatting for UI (e.g., "Jan 5, 2025") */
export const formatDisplayDate = (d: Date) => format(d, "PPP");

/** Calendar month grid support */
export interface MonthCell {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
}

/** Build a fixed 6×7 calendar grid for a given month */
export function buildMonthGrid(date: Date): MonthCell[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Pad to 42 days (6 weeks)
  while (days.length < 42) {
    days.push(addDays(days[days.length - 1], 1));
  }

  return days.map((d) => ({
    date: d,
    key: formatISO(d, { representation: "date" }),
    inMonth: isSameMonth(date, d),
    isToday: isToday(d),
  }));
}

/** Localized weekday headers, e.g., ["Sun", "Mon", ...] */
export function getWeekdayLabels(): string[] {
  const WEEK_REF = new Date(2000, 0, 2); // Sunday
  const start = startOfWeek(WEEK_REF, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "EEE"));
}

export function analyzeDate(d: Date) {
  return {
    key: toDateKey(d),
    past: isPastDate(d),
    today: isTodayDate(d),
    future: isFutureDate(d),
  };
}

/** For calendar header: "January", "2025" */
export const formatMonth = (d: Date) => format(d, "MMMM");
export const formatYear = (d: Date) => format(d, "yyyy");

/** For calendar day number (1–31) */
export const formatDayNumber = (d: Date) => format(d, "d");

/** Compare two dates for same day */
export const isSameDayDate = (a: Date, b: Date) => isSameDay(a, b);
