/**
 * Questions Module - Barrel Export
 *
 * Re-exports all question-related types, constants, and helpers.
 * Safe to import in both client and server code.
 */

// Types
export type {
  TableRow,
  SchedulePattern,
  KpiAttachment,
  PersonReference,
  FileAttachment,
  AnswerDoc,
  QuestionBase,
  AnsweredQuestion,
  InProgressQuestion,
  RecurringQuestion,
  QuestionVariant,
} from "./types";

// Validation
export { validateSchedulePattern } from "./types";

// Constants (single source of truth for all string literals)
export {
  SENDER,
  SENDER_LABEL,
  PRIVACY,
  PRIVACY_LABEL,
  FILTER,
  FILTER_OPTIONS,
  FREQUENCY,
  isValidFilter,
  type Sender,
  type Privacy,
  type FilterKey,
  type Frequency,
} from "./constants";

// Helpers
export { computeDisplayPrivacy } from "./helpers";

// Schedule Utilities
export { formatScheduleDisplay, getNextDeliveryDate } from "./scheduleUtils";
