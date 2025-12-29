/**
 * Shared Question Types
 *
 * Re-exports storage types from convex/shared and defines UI-specific extensions.
 * This is the client-side import point - never import from @convex directly in components.
 */

import type { Privacy, Frequency } from "./constants";

// ============================================
// RE-EXPORT STORAGE TYPES FROM CONVEX
// ============================================

export type {
  TableRow,
  SchedulePattern,
  KpiAttachment,
  FileAttachment,
  Id,
} from "@convex/shared/types";

// Re-export ConnectorAttachment as ConnectorReference for backwards compatibility
export type { ConnectorAttachment as ConnectorReference } from "@convex/shared/types";

// ============================================
// UI-EXTENDED TYPES
// ============================================

/**
 * Person reference - extends storage type with UI-only fields.
 * `photo` is resolved client-side, not stored in the database.
 */
import type { PersonAttachment } from "@convex/shared/types";

export interface PersonReference extends PersonAttachment {
  photo?: string;
}

// ============================================
// QUESTION VARIANT TYPES
// ============================================

// Import Id for QuestionBase (already re-exported above)
import type { Id, SchedulePattern } from "@convex/shared/types";
import type { TableRow } from "@convex/shared/types";

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
  privacy?: Privacy; // undefined = private (default)
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
