/**
 * Questions Feature - Queries
 * All read operations for questions and answers.
 */

import { query } from "@convex/_generated/server";
import { v } from "convex/values";
import type { Doc } from "@convex/_generated/dataModel";
import {
  enrichQuestionsWithVariants,
  enrichQuestionWithVariant,
} from "./enrichment";
import type { QuestionVariant } from "@/lib/questions";

// ============================================
// QUESTION QUERIES
// ============================================

/**
 * Get all questions (sorted newest first) with computed variant.
 * Excludes cancelled questions.
 *
 * Uses batch enrichment to avoid N+1 queries.
 * Client can filter this result for performance.
 */
export const getAllQuestions = query({
  args: {},
  handler: async (ctx): Promise<QuestionVariant[]> => {
    const questions = await ctx.db.query("questions").order("desc").collect();
    const activeQuestions = questions.filter((q) => !q.cancelledAt);

    // Batch enrich - fetches all answers in ONE query
    return enrichQuestionsWithVariants(ctx, activeQuestions);
  },
});

/**
 * Get a single question by ID with computed variant.
 */
export const getQuestionById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args): Promise<QuestionVariant | null> => {
    const question = await ctx.db.get(args.id);
    if (!question) return null;
    return enrichQuestionWithVariant(ctx, question);
  },
});

// ============================================
// ANSWER QUERIES
// ============================================

/**
 * Get all answers for a question thread (the conversation).
 */
export const getAnswersByThreadId = query({
  args: { questionThreadId: v.id("questions") },
  handler: async (ctx, args): Promise<Doc<"answers">[]> => {
    return await ctx.db
      .query("answers")
      .withIndex("by_questionThreadId", (q) =>
        q.eq("questionThreadId", args.questionThreadId)
      )
      .order("asc")
      .collect();
  },
});
