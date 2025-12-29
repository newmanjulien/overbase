/**
 * Questions Module Constants
 *
 * Single source of truth for all question-related constants.
 * Import from "@/lib/questions" - never use string literals directly.
 */

// ============================================
// SENDER (who sent a message)
// ============================================

export const SENDER = {
  USER: "user",
  OVERBASE: "overbase",
} as const;

export type Sender = (typeof SENDER)[keyof typeof SENDER];

/** Display labels for each sender */
export const SENDER_LABEL: Record<Sender, string> = {
  user: "You asked",
  overbase: "Overbase answered",
};

// ============================================
// PRIVACY
// ============================================

/** Privacy type: undefined = private (default), "team" = shared */
export type Privacy = "team" | undefined;

// ============================================
// QUESTION FILTERS (for sidebar)
// ============================================

export const FILTER = {
  ALL: "all",
  THIS_WEEK: "this-week",
  THIS_MONTH: "this-month",
  RECURRING: "recurring",
} as const;

export type FilterKey = (typeof FILTER)[keyof typeof FILTER];

export const FILTER_OPTIONS: { key: FilterKey; name: string }[] = [
  { key: FILTER.THIS_WEEK, name: "Asked this week" },
  { key: FILTER.THIS_MONTH, name: "Asked this month" },
  { key: FILTER.RECURRING, name: "Recurring questions" },
  { key: FILTER.ALL, name: "All questions" },
];

/** Type guard to validate a string is a valid FilterKey */
export function isValidFilter(value: string): value is FilterKey {
  return Object.values(FILTER).includes(value as FilterKey);
}

// ============================================
// SCHEDULE FREQUENCIES
// ============================================

export const FREQUENCY = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
} as const;

export type Frequency = (typeof FREQUENCY)[keyof typeof FREQUENCY];

/** Display labels for frequency (capitalized for UI) */
export const FREQUENCY_LABEL: Record<Frequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};
