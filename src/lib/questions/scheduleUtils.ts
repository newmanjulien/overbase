/**
 * Schedule Utility Functions
 *
 * Utilities for formatting and calculating schedule patterns.
 * Used by UI components to display schedules and calculate next delivery dates.
 */

import type { SchedulePattern } from "./types";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ORDINALS = ["first", "second", "third", "fourth"];

// ============================================
// DISPLAY FORMATTING
// ============================================

/**
 * Format a schedule pattern for display in UI (pills, cards, etc.)
 */
export function formatScheduleDisplay(schedule: SchedulePattern): string {
  // Weekly
  if (schedule.frequency === "weekly" && schedule.dayOfWeek !== undefined) {
    return `Weekly on ${DAYS[schedule.dayOfWeek]}s`;
  }

  // Monthly - specific day
  if (schedule.frequency === "monthly" && schedule.dayOfMonth !== undefined) {
    if (schedule.dayOfMonth === -1) {
      return "Monthly on the last day";
    }
    return `Monthly on the ${schedule.dayOfMonth}${getOrdinalSuffix(schedule.dayOfMonth)}`;
  }

  // Monthly - nth weekday (e.g., "first Monday")
  if (
    schedule.frequency === "monthly" &&
    schedule.nthWeek !== undefined &&
    schedule.dayOfWeek !== undefined
  ) {
    return `Monthly on the ${ORDINALS[schedule.nthWeek - 1]} ${DAYS[schedule.dayOfWeek]}`;
  }

  // Quarterly - day patterns
  if (schedule.frequency === "quarterly" && schedule.quarterDay) {
    const labels: Record<string, string> = {
      first: "First day of the quarter",
      last: "Last day of the quarter",
      "second-month-first": "First day of the second month",
      "third-month-first": "First day of the third month",
    };
    return labels[schedule.quarterDay] ?? "Quarterly";
  }

  // Quarterly - weekday patterns
  if (schedule.frequency === "quarterly" && schedule.quarterWeekday) {
    const labels: Record<string, string> = {
      "first-monday": "First Monday of the quarter",
      "last-monday": "Last Monday of the quarter",
    };
    return labels[schedule.quarterWeekday] ?? "Quarterly";
  }

  // Fallback
  return capitalize(schedule.frequency);
}

// ============================================
// DATE CALCULATIONS
// ============================================

/**
 * Calculate the next delivery date from a schedule pattern.
 * Used for the helper text in ScheduleModal: "Your first answer will arrive on..."
 */
export function getNextDeliveryDate(
  schedule: SchedulePattern,
  fromDate: Date = new Date()
): Date {
  // Weekly: find next occurrence of dayOfWeek
  if (schedule.frequency === "weekly" && schedule.dayOfWeek !== undefined) {
    const daysUntil = (schedule.dayOfWeek - fromDate.getDay() + 7) % 7 || 7; // || 7 ensures we get next week if today matches
    const next = new Date(fromDate);
    next.setDate(next.getDate() + daysUntil);
    return next;
  }

  // Monthly - specific day
  if (schedule.frequency === "monthly" && schedule.dayOfMonth !== undefined) {
    const next = new Date(fromDate);

    if (schedule.dayOfMonth === -1) {
      // Last day of month: go to next month, then day 0 gives last day of current month
      next.setMonth(next.getMonth() + 1, 0);
    } else {
      next.setDate(schedule.dayOfMonth);
      // If that date is in the past this month, go to next month
      if (next <= fromDate) {
        next.setMonth(next.getMonth() + 1);
      }
    }
    return next;
  }

  // Monthly - nth weekday
  if (
    schedule.frequency === "monthly" &&
    schedule.nthWeek !== undefined &&
    schedule.dayOfWeek !== undefined
  ) {
    return getNthWeekdayOfMonth(
      schedule.nthWeek,
      schedule.dayOfWeek,
      fromDate.getMonth(),
      fromDate.getFullYear(),
      fromDate
    );
  }

  // Quarterly - first day
  if (schedule.frequency === "quarterly" && schedule.quarterDay === "first") {
    return getNextQuarterStart(fromDate);
  }

  // Quarterly - last day
  if (schedule.frequency === "quarterly" && schedule.quarterDay === "last") {
    return getNextQuarterEnd(fromDate);
  }

  // TODO: Implement remaining quarterly patterns

  return fromDate;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Get the nth occurrence of a weekday in a month.
 * e.g., getNthWeekdayOfMonth(1, 1, 0, 2024) = first Monday of January 2024
 */
function getNthWeekdayOfMonth(
  nth: number,
  dayOfWeek: number,
  month: number,
  year: number,
  afterDate: Date
): Date {
  // Start at the 1st of the month
  const date = new Date(year, month, 1);

  // Find the first occurrence of the target weekday
  const firstOccurrenceDay = ((dayOfWeek - date.getDay() + 7) % 7) + 1;
  date.setDate(firstOccurrenceDay);

  // Add weeks to get to the nth occurrence
  date.setDate(date.getDate() + (nth - 1) * 7);

  // If the result is before or on afterDate, try next month
  if (date <= afterDate) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    return getNthWeekdayOfMonth(nth, dayOfWeek, nextMonth, nextYear, afterDate);
  }

  return date;
}

/**
 * Get the start of the next quarter.
 */
function getNextQuarterStart(fromDate: Date): Date {
  const month = fromDate.getMonth();
  const year = fromDate.getFullYear();

  // Quarter start months: 0 (Jan), 3 (Apr), 6 (Jul), 9 (Oct)
  const quarterStarts = [0, 3, 6, 9];
  const currentQuarterStart = quarterStarts.find((m) => m > month);

  if (currentQuarterStart !== undefined) {
    return new Date(year, currentQuarterStart, 1);
  }

  // Next year, Q1
  return new Date(year + 1, 0, 1);
}

/**
 * Get the end of the next quarter.
 */
function getNextQuarterEnd(fromDate: Date): Date {
  const month = fromDate.getMonth();
  const year = fromDate.getFullYear();

  // Quarter end months: 2 (Mar), 5 (Jun), 8 (Sep), 11 (Dec)
  const quarterEnds = [2, 5, 8, 11];
  const currentQuarterEnd = quarterEnds.find((m) => m > month);

  if (currentQuarterEnd !== undefined) {
    // Last day of that month
    return new Date(year, currentQuarterEnd + 1, 0);
  }

  // Next year, Q1 end (March 31)
  return new Date(year + 1, 3, 0);
}
