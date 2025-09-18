import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  isSameDay,
  isSameMonth,
} from "date-fns";

// ----------------------------
// Formatting helpers
// ----------------------------

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
  return `${formatMonthShort(date)} ${formatDayOfMonth(date)}`; // e.g. "Sep 17"
}

// ----------------------------
// Calendar utilities
// ----------------------------

export function getWeekdays(): Date[] {
  const baseDate = new Date(2021, 5, 6); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    return d;
  });
}

export function getCalendarGrid(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const startDay = start.getDay(); // Sunday = 0
  const daysInMonth = parseInt(format(end, "d")); // total days in month

  const grid: Date[] = [];

  // Fill in days before start
  for (let i = 0; i < startDay; i++) {
    grid.push(new Date(start.getTime() - (startDay - i) * 86400000));
  }

  // Fill in days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(new Date(date.getFullYear(), date.getMonth(), i));
  }

  // Fill in next month's days to complete grid (6 weeks max = 42 cells)
  while (grid.length < 42) {
    const lastDate = grid[grid.length - 1];
    grid.push(new Date(lastDate.getTime() + 86400000));
  }

  return grid;
}

export function getPrevMonth(date: Date): Date {
  return subMonths(date, 1);
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

// ----------------------------
// Comparisons
// ----------------------------

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function isTodayCheck(date: Date): boolean {
  return isSameDay(new Date(), date);
}
