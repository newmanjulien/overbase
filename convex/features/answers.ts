import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";

// ============================================
// ANSWERS FEATURE
// Handles both questions and their answers
// ============================================

// --------------------------------------------
// TYPES
// --------------------------------------------

/** Question with resolved creation timestamp as date string */
export type QuestionWithDate = Doc<"questions"> & {
  askedDate: string;
};

/** Answer in a thread */
export type AnswerInThread = Doc<"answers">;

// --------------------------------------------
// QUERIES
// --------------------------------------------

// Get all questions (sorted newest first)
export const getAllQuestions = query({
  args: {},
  handler: async (ctx): Promise<QuestionWithDate[]> => {
    const questions = await ctx.db.query("questions").order("desc").collect();

    return questions.map((q) => ({
      ...q,
      askedDate: new Date(q._creationTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
  },
});

// Get questions filtered by tag
export const getQuestionsByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args): Promise<QuestionWithDate[]> => {
    const questions = await ctx.db.query("questions").order("desc").collect();
    const filtered = questions.filter((q) => q.tags.includes(args.tag));

    return filtered.map((q) => ({
      ...q,
      askedDate: new Date(q._creationTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
  },
});

// Get unique tags derived from all questions
export const getUniqueTags = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const questions = await ctx.db.query("questions").collect();
    const allTags = questions.flatMap((q) => q.tags);
    return [...new Set(allTags)].sort();
  },
});

// Get a single question by ID
export const getQuestionById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args): Promise<QuestionWithDate | null> => {
    const question = await ctx.db.get(args.id);
    if (!question) return null;

    return {
      ...question,
      askedDate: new Date(question._creationTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  },
});

// Get all answers for a question (the thread)
export const getAnswersByQuestionId = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args): Promise<AnswerInThread[]> => {
    return await ctx.db
      .query("answers")
      .withIndex("by_questionId", (q) => q.eq("questionId", args.questionId))
      .order("asc")
      .collect();
  },
});

// --------------------------------------------
// MUTATIONS
// --------------------------------------------

// Create a new question
export const createQuestion = mutation({
  args: {
    content: v.string(),
    privacy: v.union(v.literal("private"), v.literal("team")),
    tags: v.array(v.string()),
    questionType: v.union(v.literal("one-time"), v.literal("recurring")),

    // Optional schedule (for recurring)
    schedule: v.optional(
      v.object({
        frequency: v.union(
          v.literal("weekly"),
          v.literal("monthly"),
          v.literal("quarterly")
        ),
        deliveryDate: v.number(),
        dataRangeFrom: v.optional(v.number()),
        dataRangeTo: v.optional(v.number()),
      })
    ),

    // Optional attachments
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
    return await ctx.db.insert("questions", {
      content: args.content,
      status: "in-progress",
      privacy: args.privacy,
      tags: args.tags,
      questionType: args.questionType,
      schedule: args.schedule,
      attachedKpis: args.attachedKpis,
      attachedPeople: args.attachedPeople,
      attachedFiles: args.attachedFiles,
    });
  },
});

// Create an answer (for followups or AI responses)
export const createAnswer = mutation({
  args: {
    questionId: v.id("questions"),
    topLabel: v.string(),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("answers", {
      questionId: args.questionId,
      topLabel: args.topLabel,
      content: args.content,
      privacy: args.privacy,
      tableData: args.tableData,
    });
  },
});

// Update privacy on a question
export const updateQuestionPrivacy = mutation({
  args: {
    id: v.id("questions"),
    privacy: v.union(v.literal("private"), v.literal("team")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { privacy: args.privacy });
  },
});

// Update privacy on an answer
export const updateAnswerPrivacy = mutation({
  args: {
    id: v.id("answers"),
    privacy: v.union(v.literal("private"), v.literal("team")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { privacy: args.privacy });
  },
});

// Update question status (e.g., in-progress → completed)
export const updateQuestionStatus = mutation({
  args: {
    id: v.id("questions"),
    status: v.union(v.literal("in-progress"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
