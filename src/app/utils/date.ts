import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  startOfDay,
  isBefore,
} from "date-fns";

/**
 * Format helpers
 */
export const formatMonthYear = (date: Date) => format(date, "MMMM yyyy");
export const formatDayLabel = (date: Date) => format(date, "EEE dd"); // e.g. Mon 16
export const formatDayOfMonth = (date: Date) => format(date, "d");
export const formatWeekdayShort = (date: Date) =>
  format(date, "EEE").toUpperCase();

/**
 * Calendar helpers
 */
export const getCalendarGrid = (date: Date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
};

export const getWeekdays = () =>
  eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: endOfWeek(new Date(), { weekStartsOn: 0 }),
  });

/**
 * Navigation helpers
 */
export const getPrevMonth = (date: Date) => subMonths(date, 1);
export const getNextMonth = (date: Date) => addMonths(date, 1);

/**
 * Comparison helpers
 */
export const isSameDayCheck = (d1: Date | null, d2: Date) =>
  !!d1 && isSameDay(d1, d2);

export const isSameMonthCheck = (reference: Date, day: Date) =>
  isSameMonth(day, reference);

/**
 * Custom helpers
 */
export const isBeforeToday = (date: Date) => {
  const today = startOfDay(new Date());
  return isBefore(date, today);
};

export const isTodayOrFuture = (date: Date) => !isBeforeToday(date);
