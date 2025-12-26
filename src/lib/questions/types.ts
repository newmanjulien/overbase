/**
 * Shared Question Types
 *
 * These types are used by both client components and can be imported
 * by Convex server code. This is the single source of truth for
 * question-related types.
 */

import type { Doc, Id } from "@convex/_generated/dataModel";
import type { Privacy, Sender, Frequency } from "./constants";

// ============================================
// TABLE DATA TYPES
// ============================================

/** Table row structure for answered questions */
export type TableRow = {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  column5: string;
};

// ============================================
// SCHEDULE TYPES (for recurring questions)
// ============================================

/**
 * Schedule pattern for recurring questions.
 * Matches dropdown options directly - no date processing needed.
 *
 * Validation rules (enforced by validateSchedulePattern):
 * - weekly: requires dayOfWeek
 * - monthly: requires dayOfMonth OR (nthWeek + dayOfWeek)
 * - quarterly: requires quarterDay OR quarterWeekday
 */
export interface SchedulePattern {
  frequency: Frequency;

  // Weekly: which day (0=Sun, 1=Mon, ..., 6=Sat)
  dayOfWeek?: number;

  // Monthly: specific day of month (1-31, or -1 for last day)
  dayOfMonth?: number;

  // Monthly: nth weekday pattern (1=first, 2=second, 3=third, 4=fourth)
  // Used with dayOfWeek for patterns like "first Monday"
  nthWeek?: number;

  // Quarterly: predefined day patterns
  quarterDay?: "first" | "last" | "second-month-first" | "third-month-first";

  // Quarterly: predefined weekday patterns
  quarterWeekday?: "first-monday" | "last-monday";

  // Data range: how many days of data to analyze before delivery
  dataRangeDays: number;
}

/**
 * Validates that a SchedulePattern has the required fields for its frequency.
 * Returns an error message if invalid, null if valid.
 */
export function validateSchedulePattern(
  schedule: SchedulePattern
): string | null {
  switch (schedule.frequency) {
    case "weekly":
      if (schedule.dayOfWeek === undefined) {
        return "Weekly schedule requires dayOfWeek";
      }
      break;
    case "monthly":
      const hasMonthDay = schedule.dayOfMonth !== undefined;
      const hasNthWeekday =
        schedule.nthWeek !== undefined && schedule.dayOfWeek !== undefined;
      if (!hasMonthDay && !hasNthWeekday) {
        return "Monthly schedule requires dayOfMonth or (nthWeek + dayOfWeek)";
      }
      break;
    case "quarterly":
      if (
        schedule.quarterDay === undefined &&
        schedule.quarterWeekday === undefined
      ) {
        return "Quarterly schedule requires quarterDay or quarterWeekday";
      }
      break;
  }
  return null;
}

// ============================================
// ATTACHMENT TYPES (match schema.ts)
// ============================================

/**
 * KPI attachment shape as stored in Convex.
 */
export interface KpiAttachment {
  metric: string;
  definition: string;
  antiDefinition: string;
}

/**
 * Person reference - used for both:
 * - Attaching people to a question (stored in Convex)
 * - Displaying people in selection modals
 */
export interface PersonReference {
  id: string;
  name: string;
}

/**
 * File attachment shape as stored in Convex.
 */
export interface FileAttachment {
  fileName: string;
  context?: string;
  // Future: fileId?: Id<"_storage">;
}

// ============================================
// ANSWER TYPES
// ============================================

/**
 * Raw answer document from Convex.
 * Used for typing query return values.
 */
export type AnswerDoc = Doc<"answers">;

// ============================================
// QUESTION VARIANT TYPES
// ============================================

/**
 * Base question with computed/derived fields.
 *
 * In the new architecture:
 * - displayContent comes from first answer's content
 * - askedDate/askedTimestamp come from first answer's _creationTime
 * - status is derived from last answer's sender
 * - displayPrivacy is "team" if ANY answer is "team", else "private"
 */
export type QuestionBase = {
  // From questions table
  _id: Id<"questions">;
  _creationTime: number;
  privacy: Privacy;
  schedule?: SchedulePattern;
  cancelledAt?: number;

  // Derived fields (computed by enrichQuestionWithVariant)
  displayContent: string;
  askedDate: string;
  askedTimestamp: number;
  status: "in-progress" | "completed";
  displayPrivacy: Privacy;
  isRecurring: boolean;
};

/**
 * Answered question variant - has table data from LAST Overbase answer
 */
export type AnsweredQuestion = QuestionBase & {
  variant: "answered";
  tableData: TableRow[];
};

/**
 * In-progress question variant - shows yellow pill, no table
 */
export type InProgressQuestion = QuestionBase & {
  variant: "in-progress";
};

/**
 * Recurring question variant - shows red frequency pill, scheduled date
 */
export type RecurringQuestion = QuestionBase & {
  variant: "recurring";
  frequency: Frequency;
  scheduledDate: string;
};

/**
 * Discriminated union of all question card variants
 */
export type QuestionVariant =
  | AnsweredQuestion
  | InProgressQuestion
  | RecurringQuestion;
