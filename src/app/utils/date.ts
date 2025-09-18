import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  isSameDay,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  isBefore,
  startOfToday,
} from "date-fns";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/**
 * Calendar grid is Sunday-start, 6 weeks (42 cells) to match current UI.
 * If you ever want Monday-start, change WEEK_STARTS_ON to 1 and you're done.
 */
const WEEK_STARTS_ON: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0; // Sunday
const GRID_CELLS = 42;

/** Known Sunday used only to generate weekday labels. */
const WEEK_REF = new Date(2000, 0, 2); // 2000-01-02 was a Sunday

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy"); // e.g. "September 2025"
}

export function formatDayOfMonth(date: Date): string {
  return format(date, "d"); // e.g. "17"
}

export function formatMonthShort(date: Date): string {
  return format(date, "MMM"); // e.g. "Sep"
}

export function formatWeekdayShort(date: Date): string {
  return format(date, "EEE").toUpperCase(); // e.g. "MON"
}

export function formatWeekdayLong(date: Date): string {
  return format(date, "EEEE"); // e.g. "Monday"
}

// Composite label: for display only (don't parse downstream!)
export function formatDayLabel(date: Date): string {
  // Equivalent to `${formatMonthShort(date)} ${formatDayOfMonth(date)}`
  return format(date, "MMM d"); // e.g. "Sep 17"
}

// ---------------------------------------------------------------------------
// Calendar utilities
// ---------------------------------------------------------------------------

/**
 * Returns 7 consecutive dates starting from the week start (Sunday),
 * suitable for formatting weekday names. Date values are stable but arbitrary.
 */
export function getWeekdays(): Date[] {
  const start = startOfWeek(WEEK_REF, { weekStartsOn: WEEK_STARTS_ON });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Returns a fixed 6x7 grid (42 dates) covering the month, padded with
 * leading/trailing days as needed. DST-safe and locale-week-start aware.
 */
export function getCalendarGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Ensure 6 rows even when a month spans only 5 weeks visually.
  while (days.length < GRID_CELLS) {
    days.push(addDays(days[days.length - 1], 1));
  }

  return days;
}

export function getPrevMonth(date: Date): Date {
  return subMonths(date, 1);
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

export function isSameDayCheck(date1: Date | null, date2: Date): boolean {
  return !!date1 && isSameDay(date1, date2);
}

export function isSameMonthCheck(date1: Date, date2: Date): boolean {
  return isSameMonth(date1, date2);
}

export function getLocalDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function isBeforeToday(date: Date): boolean {
  return isBefore(date, startOfToday());
}

export function isTodayCheck(date: Date): boolean {
  return isSameDay(new Date(), date);
}
