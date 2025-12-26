/**
 * Questions Feature - Mutations
 * All write operations for questions and answers.
 */

import { mutation } from "@convex/_generated/server";
import { v } from "convex/values";
import { validateSchedulePattern, SENDER } from "@/lib/questions";

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
    privacy: v.union(v.literal("private"), v.literal("team")),

    // Schedule: undefined = one-time, present = recurring
    schedule: v.optional(
      v.object({
        frequency: v.union(
          v.literal("weekly"),
          v.literal("monthly"),
          v.literal("quarterly")
        ),
        dayOfWeek: v.optional(v.number()),
        dayOfMonth: v.optional(v.number()),
        nthWeek: v.optional(v.number()),
        quarterDay: v.optional(
          v.union(
            v.literal("first"),
            v.literal("last"),
            v.literal("second-month-first"),
            v.literal("third-month-first")
          )
        ),
        quarterWeekday: v.optional(
          v.union(v.literal("first-monday"), v.literal("last-monday"))
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
  },
  handler: async (ctx, args) => {
    // Validate schedule if provided
    if (args.schedule) {
      const validationError = validateSchedulePattern(args.schedule);
      if (validationError) {
        throw new Error(validationError);
      }
    }

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
    });

    return questionId;
  },
});

/**
 * Update privacy on a question AND cascade to all child answers.
 * This is the ONLY way to update question privacy - ensures consistency.
 */
export const updateQuestionPrivacy = mutation({
  args: {
    id: v.id("questions"),
    privacy: v.union(v.literal("private"), v.literal("team")),
  },
  handler: async (ctx, args) => {
    // Update the question
    await ctx.db.patch(args.id, { privacy: args.privacy });

    // Cascade to all child answers
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_questionThreadId", (idx) =>
        idx.eq("questionThreadId", args.id)
      )
      .collect();

    // Update each answer atomically
    await Promise.all(
      answers.map((answer) =>
        ctx.db.patch(answer._id, { privacy: args.privacy })
      )
    );
  },
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
    privacy: v.union(v.literal("private"), v.literal("team")),
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
    });
  },
});

/**
 * Update privacy on an answer.
 */
export const updateAnswerPrivacy = mutation({
  args: {
    id: v.id("answers"),
    privacy: v.union(v.literal("private"), v.literal("team")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { privacy: args.privacy });
  },
});
