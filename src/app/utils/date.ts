// Utilities for handling dates in the app

// Format a Date to "Month YYYY" (e.g., "September 2025")
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Format a Date to just the day number (e.g., "17")
export function formatDayOfMonth(date: Date): string {
  return date.getDate().toString();
}

// Format weekday short (e.g., "Mon", "Tue")
export function formatWeekdayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Format a date label like "Fri 05"
export function formatDayLabel(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const day = date.getDate().toString().padStart(2, "0");
  return `${weekday} ${day}`;
}

// Build a grid of dates for a given month
export function getCalendarGrid(currentDate: Date): Date[] {
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const end = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

// Get weekdays starting Sunday
export function getWeekdays(): Date[] {
  const base = new Date(2020, 5, 7); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}

// Previous month
export function getPrevMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

// Next month
export function getNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

// Same day check (ignoring time)
export function isSameDayCheck(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Same month check
export function isSameMonthCheck(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// Check if date is before today
export function isBeforeToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// ✅ Always get YYYY-MM-DD in the user's local timezone
export function getLocalDateKey(date: Date): string {
  return date.toLocaleDateString("en-CA");
}
