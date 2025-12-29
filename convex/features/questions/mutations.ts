/**
 * Questions Feature - Mutations
 * All write operations for questions and answers.
 */

import { mutation } from "@convex/_generated/server";
import { v } from "convex/values";
import { SENDER } from "@/lib/questions";
import { setQuestionPrivacy, setAnswerPrivacy } from "./privacy";

// ============================================
// QUESTION MUTATIONS
// ============================================

/**
 * Create a new question.
 *
 * In the new architecture:
 * - Creates a question (thread metadata)
 * - Creates the first answer (the user's question with attachments)
 */
export const createQuestion = mutation({
  args: {
    // Content goes into first answer, not the question itself
    content: v.string(),
    privacy: v.optional(v.literal("team")),

    // Schedule: undefined = one-time, present = recurring
    schedule: v.optional(
      v.object({
        rrule: v.string(),
        frequency: v.union(
          v.literal("weekly"),
          v.literal("monthly"),
          v.literal("quarterly")
        ),
        dataRangeDays: v.number(),
      })
    ),

    // Attachments go on the first answer
    attachedKpis: v.optional(
      v.array(
        v.object({
          metric: v.string(),
          definition: v.string(),
          antiDefinition: v.string(),
        })
      )
    ),
    attachedPeople: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
        })
      )
    ),
    attachedFiles: v.optional(
      v.array(
        v.object({
          fileName: v.string(),
          context: v.optional(v.string()),
        })
      )
    ),
    attachedConnectors: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          logo: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Validation happens client-side via rrule parse

    // 1. Create the question (thread metadata only)
    const questionId = await ctx.db.insert("questions", {
      privacy: args.privacy,
      schedule: args.schedule,
    });

    // 2. Create the first answer (the user's question)
    await ctx.db.insert("answers", {
      questionThreadId: questionId,
      sender: SENDER.USER,
      content: args.content,
      privacy: args.privacy,
      attachedKpis: args.attachedKpis,
      attachedPeople: args.attachedPeople,
      attachedFiles: args.attachedFiles,
      attachedConnectors: args.attachedConnectors,
    });

    return questionId;
  },
});

/**
 * Update privacy on a question.
 * Delegates to privacy module which handles cascading to answers.
 */
export const updateQuestionPrivacy = mutation({
  args: {
    id: v.id("questions"),
    privacy: v.optional(v.literal("team")),
  },
  handler: (ctx, args) => setQuestionPrivacy(ctx, args.id, args.privacy),
});

/**
 * Cancel a question (soft delete).
 * Sets cancelledAt timestamp - question remains in DB but won't appear in UI.
 * Note: In the new architecture, this can only be done when there's exactly 1 answer.
 */
export const cancelQuestion = mutation({
  args: {
    id: v.id("questions"),
  },
  handler: async (ctx, args) => {
    // Validate: can only cancel if there's just the initial question (1 answer)
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_questionThreadId", (idx) =>
        idx.eq("questionThreadId", args.id)
      )
      .collect();

    if (answers.length > 1) {
      throw new Error("Cannot cancel a question that has been answered");
    }

    await ctx.db.patch(args.id, { cancelledAt: Date.now() });
  },
});

// ============================================
// ANSWER MUTATIONS
// ============================================

/**
 * Create an answer (for followups or Overbase responses).
 */
export const createAnswer = mutation({
  args: {
    questionThreadId: v.id("questions"),
    sender: v.union(v.literal("user"), v.literal("overbase")),
    content: v.optional(v.string()),
    privacy: v.optional(v.literal("team")),
    tableData: v.optional(
      v.array(
        v.object({
          column1: v.string(),
          column2: v.string(),
          column3: v.string(),
          column4: v.string(),
          column5: v.string(),
        })
      )
    ),
    // Attachments (for follow-up questions from user)
    attachedKpis: v.optional(
      v.array(
        v.object({
          metric: v.string(),
          definition: v.string(),
          antiDefinition: v.string(),
        })
      )
    ),
    attachedPeople: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
        })
      )
    ),
    attachedFiles: v.optional(
      v.array(
        v.object({
          fileName: v.string(),
          context: v.optional(v.string()),
        })
      )
    ),
    attachedConnectors: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          logo: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("answers", {
      questionThreadId: args.questionThreadId,
      sender: args.sender,
      content: args.content,
      privacy: args.privacy,
      tableData: args.tableData,
      attachedKpis: args.attachedKpis,
      attachedPeople: args.attachedPeople,
      attachedFiles: args.attachedFiles,
      attachedConnectors: args.attachedConnectors,
    });
  },
});

/**
 * Update privacy on an answer.
 * Delegates to privacy module which handles recomputing question privacy.
 */
export const updateAnswerPrivacy = mutation({
  args: {
    id: v.id("answers"),
    privacy: v.optional(v.literal("team")),
  },
  handler: (ctx, args) => setAnswerPrivacy(ctx, args.id, args.privacy),
});

/**
 * Cancel an answer (soft delete).
 * Sets cancelledAt timestamp - answer remains in DB but won't appear in UI.
 * Used for cancelling pending follow-up questions from the user.
 */
export const cancelAnswer = mutation({
  args: {
    id: v.id("answers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { cancelledAt: Date.now() });
  },
});
