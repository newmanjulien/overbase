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
 * Uses RFC 5545 recurrence rules via the rrule library.
 * The rrule string is the source of truth for recurrence logic.
 */
export interface SchedulePattern {
  /** RFC 5545 recurrence rule string (e.g., "FREQ=WEEKLY;BYDAY=MO") */
  rrule: string;

  /** Human-friendly frequency for UI grouping */
  frequency: Frequency;

  /** How many days of data to analyze before delivery */
  dataRangeDays: number;
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

/**
 * Connector reference - used for attaching connectors to questions/answers.
 */
export interface ConnectorReference {
  id: string;
  title: string;
  logo: string;
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
