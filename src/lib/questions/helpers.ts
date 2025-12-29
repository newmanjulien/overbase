/**
 * Question Helpers
 *
 * Runtime utilities for formatting and calculating schedules.
 * Uses the rrule library for RFC 5545 compliant recurrence rules.
 */
import { RRule } from "rrule";
import type { SchedulePattern } from "./types";

/**
 * Format a schedule pattern for display in UI (pills, cards, etc.)
 * Uses rrule's built-in natural language generation.
 */
export function formatScheduleDisplay(schedule: SchedulePattern): string {
  try {
    return capitalize(RRule.fromString(schedule.rrule).toText());
  } catch {
    return capitalize(schedule.frequency);
  }
}

/**
 * Calculate the next delivery date from a schedule pattern.
 * Used for helper text: "Your first answer will arrive on..."
 */
export function getNextDeliveryDate(
  schedule: SchedulePattern,
  from: Date = new Date()
): Date {
  try {
    return RRule.fromString(schedule.rrule).after(from, true) ?? from;
  } catch {
    return from;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
