/**
 * Questions Feature - Queries
 * All read operations for questions and answers.
 */

import { query } from "@convex/_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "@convex/types";
import {
  enrichQuestionsWithVariants,
  enrichQuestionWithVariant,
} from "./enrichment";
import type { QuestionVariant } from "@/lib/questions";

// ============================================
// QUESTION QUERIES
// ============================================

/**
 * Get questions with computed variant using pagination.
 * Excludes cancelled questions.
 *
 * Uses batch enrichment for the current page to avoid N+1 queries.
 */
export const getAllQuestions = query({
  args: {
    paginationOpts: paginationOptsValidator,
    /** Filter key: "all", "this-week", "this-month", "recurring" */
    filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("questions").order("desc");

    // Always exclude cancelled questions in the query to ensure accurate pagination
    q = q.filter((q) => q.eq(q.field("cancelledAt"), undefined));

    // Apply specific logic for each filter type
    if (args.filter === "this-week") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      q = q.filter((q) => q.gte(q.field("_creationTime"), weekAgo));
    } else if (args.filter === "this-month") {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      q = q.filter((q) => q.gte(q.field("_creationTime"), monthAgo));
    } else if (args.filter === "recurring") {
      // Filter for questions that have a schedule defined
      q = q.filter((q) => q.neq(q.field("schedule"), undefined));
    }

    const paginatedQuestions = await q.paginate(args.paginationOpts);

    // Batch enrich only the items on this page
    // Since we filtered in the query, paginatedQuestions.page has only active questions
    const enrichedPage = await enrichQuestionsWithVariants(
      ctx,
      paginatedQuestions.page,
    );

    return {
      ...paginatedQuestions,
      page: enrichedPage,
    };
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
        q.eq("questionThreadId", args.questionThreadId),
      )
      .order("asc")
      .collect();
  },
});
