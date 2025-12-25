import type { FunctionReturnType } from "convex/server";
import type { api } from "@convex/_generated/api";

// Re-export core attachment types from Convex shared
export type {
  KpiAttachment,
  PersonAttachment,
  FileAttachment,
} from "@convex/shared/attachmentTypes";

// Re-export UI-specific types from modals shared
export type {
  ForwardEntry,
  PersonAttachmentWithInfo,
} from "@/components/modals/shared/modalTypes";

// Re-export question variant types from Convex
export type {
  AnsweredQuestion,
  InProgressQuestion,
  RecurringQuestion,
  QuestionVariant,
  TableRow,
} from "@convex/features/answers";

/**
 * Raw question type as returned from Convex query.
 * Now returns QuestionVariant (discriminated union)
 */
export type QuestionFromConvex = FunctionReturnType<
  typeof api.features.answers.getAllQuestions
>[number];

/**
 * Raw answer type as returned from Convex query.
 */
export type AnswerFromConvex = FunctionReturnType<
  typeof api.features.answers.getAnswersByQuestionId
>[number];

/**
 * @deprecated Use QuestionVariant instead
 */
export type Question = QuestionFromConvex;

/**
 * Answer for presentational components.
 */
export type Answer = AnswerFromConvex;

/**
 * @deprecated Use QuestionVariant directly
 */
export function normalizeQuestion(q: QuestionFromConvex): QuestionFromConvex {
  return q;
}

/**
 * Transforms raw Convex answer
 */
export function normalizeAnswer(a: AnswerFromConvex): Answer {
  return a;
}
