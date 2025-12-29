import { RRule } from "rrule";
import type { Frequency } from "@/lib/questions";

// ============================================
// SCHEDULE OPTIONS (rrule-based)
// ============================================

export interface ScheduleOption {
  label: string;
  rruleOptions: Partial<ConstructorParameters<typeof RRule>[0]>;
}

// Weekly options
export const WEEKLY_OPTIONS: ScheduleOption[] = [
  {
    label: "Sundays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.SU },
  },
  {
    label: "Mondays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.MO },
  },
  {
    label: "Tuesdays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.TU },
  },
  {
    label: "Wednesdays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.WE },
  },
  {
    label: "Thursdays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.TH },
  },
  {
    label: "Fridays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.FR },
  },
  {
    label: "Saturdays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.SA },
  },
];

// Monthly options
export const MONTHLY_OPTIONS: ScheduleOption[] = [
  {
    label: "First day of the month",
    rruleOptions: { freq: RRule.MONTHLY, bymonthday: 1 },
  },
  {
    label: "First Monday of the month",
    rruleOptions: { freq: RRule.MONTHLY, byweekday: RRule.MO, bysetpos: 1 },
  },
  {
    label: "Second Monday of the month",
    rruleOptions: { freq: RRule.MONTHLY, byweekday: RRule.MO, bysetpos: 2 },
  },
  {
    label: "Third Monday of the month",
    rruleOptions: { freq: RRule.MONTHLY, byweekday: RRule.MO, bysetpos: 3 },
  },
  {
    label: "Fourth Monday of the month",
    rruleOptions: { freq: RRule.MONTHLY, byweekday: RRule.MO, bysetpos: 4 },
  },
  {
    label: "Last day of the month",
    rruleOptions: { freq: RRule.MONTHLY, bymonthday: -1 },
  },
];

// Quarterly options (monthly with interval: 3)
// dtstart aligns to quarter boundaries (Jan 1 for Q1, Apr 1 for Q2, etc.)
const currentYear = new Date().getFullYear();

export const QUARTERLY_OPTIONS: ScheduleOption[] = [
  {
    label: "First day of the quarter",
    rruleOptions: {
      freq: RRule.MONTHLY,
      interval: 3,
      bymonthday: 1,
      dtstart: new Date(Date.UTC(currentYear, 0, 1)),
    },
  },
  {
    label: "First Monday of the quarter",
    rruleOptions: {
      freq: RRule.MONTHLY,
      interval: 3,
      byweekday: RRule.MO,
      bysetpos: 1,
      dtstart: new Date(Date.UTC(currentYear, 0, 1)),
    },
  },
  {
    label: "Last Monday of the quarter",
    rruleOptions: {
      freq: RRule.MONTHLY,
      interval: 3,
      byweekday: RRule.MO,
      bysetpos: -1,
      dtstart: new Date(Date.UTC(currentYear, 2, 1)),
    },
  },
  {
    label: "Last day of the quarter",
    rruleOptions: {
      freq: RRule.MONTHLY,
      interval: 3,
      bymonthday: -1,
      dtstart: new Date(Date.UTC(currentYear, 2, 1)),
    },
  },
];

// Data range options
export interface DataRangeOption {
  label: string;
  days: number;
}

export const DATA_RANGE_OPTIONS: DataRangeOption[] = [
  { label: "Data from the previous week", days: 7 },
  { label: "Data from the previous month", days: 30 },
  { label: "Data from the previous 2 months", days: 60 },
  { label: "Data from the previous quarter", days: 90 },
  { label: "Data from the previous 2 quarters", days: 180 },
  { label: "Data from the previous year", days: 365 },
];

export function getScheduleOptions(frequency: Frequency): ScheduleOption[] {
  switch (frequency) {
    case "weekly":
      return WEEKLY_OPTIONS;
    case "monthly":
      return MONTHLY_OPTIONS;
    case "quarterly":
      return QUARTERLY_OPTIONS;
  }
}
