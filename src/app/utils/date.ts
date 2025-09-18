export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatDayOfMonth(date: Date): string {
  return date.getDate().toString();
}

export function formatWeekdayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
  });
}

export function getCalendarGrid(currentDate: Date): Date[] {
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const end = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const days: Date[] = [];

  // Fill from start of week
  const firstDayOfWeek = new Date(start);
  firstDayOfWeek.setDate(start.getDate() - start.getDay());

  // Fill through end of week of last day
  const lastDayOfWeek = new Date(end);
  lastDayOfWeek.setDate(end.getDate() + (6 - end.getDay()));

  let day = new Date(firstDayOfWeek);
  while (day <= lastDayOfWeek) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  return days;
}

export function getWeekdays(): Date[] {
  const weekdays: Date[] = [];
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    weekdays.push(d);
  }
  return weekdays;
}

export function getPrevMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() - 1);
  return newDate;
}

export function getNextMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + 1);
  return newDate;
}

export function isSameDayCheck(
  date1: Date | null,
  date2: Date | null
): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameMonthCheck(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

export function getLocalDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isBeforeToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

export function isTodayCheck(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);
  return today.getTime() === compare.getTime();
}
