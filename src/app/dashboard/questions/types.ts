/**
 * Questions Page Types
 *
 * Page-specific types that derive from Convex query return types.
 * For shared types, import directly from @/lib/questions.
 */

import type { FunctionReturnType } from "convex/server";
import type { api } from "@convex/_generated/api";

// ============================================
// PAGE-SPECIFIC TYPES (derived from API)
// ============================================

/**
 * Question type as returned from Convex query.
 * This is the exact shape returned by getAllQuestions.
 */
export type QuestionFromConvex = FunctionReturnType<
  typeof api.features.questions.queries.getAllQuestions
>[number];

/**
 * Answer type as returned from Convex query.
 */
export type AnswerFromConvex = FunctionReturnType<
  typeof api.features.questions.queries.getAnswersByThreadId
>[number];

/**
 * Alias for presentation layer.
 */
export type Answer = AnswerFromConvex;
