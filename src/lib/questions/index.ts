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
  FileAttachment,
  ConnectorReference,
  AnsweredQuestion,
  InProgressQuestion,
  RecurringQuestion,
  QuestionVariant,
  Id,
} from "./types";

// Constants (single source of truth for all string literals)
export {
  SENDER,
  SENDER_LABEL,
  FILTER,
  FILTER_OPTIONS,
  FREQUENCY,
  FREQUENCY_LABEL,
  isValidFilter,
  type Sender,
  type Privacy,
  type FilterKey,
  type Frequency,
} from "./constants";

// Schedule Helpers
export { formatScheduleDisplay, getNextDeliveryDate } from "./helpers";

// Thread Derivation
export { deriveThread } from "./thread";
export type {
  ThreadCard,
  QuestionCard,
  AnswerCard,
  StatusCard,
  InfoCard,
  ThreadAnswer,
} from "./thread";
