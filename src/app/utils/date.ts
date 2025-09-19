import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  isBefore,
  startOfToday,
  isSameDay as _isSameDay,
  isSameMonth as _isSameMonth,
  isToday as _isToday,
  addMonths as _addMonths,
  subMonths as _subMonths,
  formatISO,
} from "date-fns";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Sunday-start calendar, fixed 6 rows (42 cells) */
const WEEK_STARTS_ON: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0;
const GRID_CELLS = 42;

/** Arbitrary known-Sunday to derive weekday labels */
const WEEK_REF = new Date(2000, 0, 2); // 2000-01-02 (Sunday)

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatMonthLong(date: Date): string {
  return format(date, "MMMM"); // e.g., "September"
}

export function formatMonthShort(date: Date): string {
  return format(date, "MMM"); // e.g., "Sep"
}

export function formatYear(date: Date): string {
  return format(date, "yyyy"); // e.g., "2025"
}

export function formatDayOfMonth(date: Date): string {
  return format(date, "d"); // e.g., "17"
}

export function formatWeekdayShort(date: Date): string {
  return format(date, "EEE"); // e.g., "Mon"
}

export function formatWeekdayLong(date: Date): string {
  return format(date, "EEEE"); // e.g., "Monday"
}

// ---------------------------------------------------------------------------
// Header labels
// ---------------------------------------------------------------------------

/** Return weekday short labels directly for the header row. */
export function getWeekdayLabels(): string[] {
  const start = startOfWeek(WEEK_REF, { weekStartsOn: WEEK_STARTS_ON });
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "EEE"));
}

// ---------------------------------------------------------------------------
// Calendar grid
// ---------------------------------------------------------------------------

export type MonthCell = {
  date: Date;
  key: string; // "YYYY-MM-DD" in local time
  inMonth: boolean;
  isToday: boolean;
};

export function getCalendarGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Ensure 6 rows even when visually only 5 are needed.
  while (days.length < GRID_CELLS) {
    days.push(addDays(days[days.length - 1], 1));
  }

  return days;
}

export function buildMonthGrid(date: Date): MonthCell[] {
  const grid = getCalendarGrid(date);
  return grid.map((d) => ({
    date: d,
    key: getLocalDateKey(d),
    inMonth: _isSameMonth(date, d),
    isToday: _isToday(d),
  }));
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export function getPrevMonth(date: Date): Date {
  return _subMonths(date, 1);
}

export function getNextMonth(date: Date): Date {
  return _addMonths(date, 1);
}

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

export function isSameDayCheck(date1: Date | null, date2: Date): boolean {
  return !!date1 && _isSameDay(date1, date2);
}

export function isSameMonthCheck(date1: Date, date2: Date): boolean {
  return _isSameMonth(date1, date2);
}

export function getLocalDateKey(date: Date): string {
  return formatISO(date, { representation: "date" }); // "yyyy-MM-dd"
}

export function isBeforeToday(date: Date): boolean {
  return isBefore(date, startOfToday());
}

export function isTodayCheck(date: Date): boolean {
  return _isToday(date);
}

export function isAfterToday(date: Date): boolean {
  return isBefore(startOfToday(), date);
}

// ---------------------------------------------------------------------------
// Canonical re-exports
// ---------------------------------------------------------------------------

export {
  _isSameDay as isSameDay,
  _isSameMonth as isSameMonth,
  _isToday as isToday,
};
export { _addMonths as addMonths, _subMonths as subMonths };
