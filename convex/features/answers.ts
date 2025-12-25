import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { BASE_QUESTION_TAGS } from "../shared/constants";
import { computeDisplayPrivacy, type PrivacyValue } from "../shared/privacy";

// ============================================
// ANSWERS FEATURE
// Handles both questions and their answers
// ============================================

// --------------------------------------------
// TYPES
// --------------------------------------------

/** Table row structure for answered questions */
export type TableRow = {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  column5: string;
};

/**
 * Base question with resolved creation timestamp and computed display privacy.
 * displayPrivacy = "team" if ANY answer is "team", else "private"
 */
type QuestionBase = Doc<"questions"> & {
  askedDate: string;
  displayPrivacy: PrivacyValue;
};

/**
 * Answered question variant - has table data from first answer, no pill
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
  frequency: "weekly" | "monthly" | "quarterly";
  scheduledDate: string;
};

/**
 * Discriminated union of all question card variants
 */
export type QuestionVariant =
  | AnsweredQuestion
  | InProgressQuestion
  | RecurringQuestion;

/**
 * @deprecated Use QuestionVariant instead - kept for backward compatibility
 */
export type QuestionWithDate = QuestionBase;

/** Answer in a thread */
export type AnswerInThread = Doc<"answers">;

// --------------------------------------------
// QUERIES
// --------------------------------------------

// Get all questions (sorted newest first) with computed variant
export const getAllQuestions = query({
  args: {},
  handler: async (ctx): Promise<QuestionVariant[]> => {
    const questions = await ctx.db.query("questions").order("desc").collect();

    // For each question, compute variant and get associated data
    const questionsWithVariants = await Promise.all(
      questions.map(async (q) => {
        const answers = await ctx.db
          .query("answers")
          .withIndex("by_questionId", (idx) => idx.eq("questionId", q._id))
          .collect();

        const answerPrivacies = answers.map((a) => a.privacy);
        const displayPrivacy = computeDisplayPrivacy(
          q.privacy,
          answerPrivacies
        );

        const askedDate = new Date(q._creationTime).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric", year: "numeric" }
        );

        const base = { ...q, askedDate, displayPrivacy };

        // Determine variant based on questionType and status
        if (q.questionType === "recurring" && q.schedule) {
          return {
            ...base,
            variant: "recurring" as const,
            frequency: q.schedule.frequency,
            scheduledDate: new Date(q.schedule.deliveryDate).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            ),
          };
        }

        if (q.status === "in-progress") {
          return {
            ...base,
            variant: "in-progress" as const,
          };
        }

        // Completed (answered) - get tableData from first answer
        const firstAnswerWithTable = answers.find((a) => a.tableData);
        return {
          ...base,
          variant: "answered" as const,
          tableData: (firstAnswerWithTable?.tableData ?? []) as TableRow[],
        };
      })
    );

    return questionsWithVariants;
  },
});

// Get questions filtered by tag with computed variant
export const getQuestionsByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args): Promise<QuestionVariant[]> => {
    const questions = await ctx.db.query("questions").order("desc").collect();
    const filtered = questions.filter((q) => q.tags.includes(args.tag));

    // For each question, compute variant and get associated data
    const questionsWithVariants = await Promise.all(
      filtered.map(async (q) => {
        const answers = await ctx.db
          .query("answers")
          .withIndex("by_questionId", (idx) => idx.eq("questionId", q._id))
          .collect();

        const answerPrivacies = answers.map((a) => a.privacy);
        const displayPrivacy = computeDisplayPrivacy(
          q.privacy,
          answerPrivacies
        );

        const askedDate = new Date(q._creationTime).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric", year: "numeric" }
        );

        const base = { ...q, askedDate, displayPrivacy };

        // Determine variant based on questionType and status
        if (q.questionType === "recurring" && q.schedule) {
          return {
            ...base,
            variant: "recurring" as const,
            frequency: q.schedule.frequency,
            scheduledDate: new Date(q.schedule.deliveryDate).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            ),
          };
        }

        if (q.status === "in-progress") {
          return {
            ...base,
            variant: "in-progress" as const,
          };
        }

        // Completed (answered) - get tableData from first answer
        const firstAnswerWithTable = answers.find((a) => a.tableData);
        return {
          ...base,
          variant: "answered" as const,
          tableData: (firstAnswerWithTable?.tableData ?? []) as TableRow[],
        };
      })
    );

    return questionsWithVariants;
  },
});

// Get unique tags (always includes base tags + any additional from questions)
// Preserves the order defined in BASE_QUESTION_TAGS, with additional tags appended
export const getUniqueTags = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const questions = await ctx.db.query("questions").collect();
    const dynamicTags = questions.flatMap((q) => q.tags);
    // Start with base tags in their defined order
    const baseTagKeys: string[] = BASE_QUESTION_TAGS.map((t) => t.key);
    // Find any additional tags not in base tags
    const additionalTags = [...new Set(dynamicTags)].filter(
      (tag) => !baseTagKeys.includes(tag)
    );
    // Base tags first (in order), then any additional tags
    return [...baseTagKeys, ...additionalTags];
  },
});

// Get a single question by ID with computed variant
export const getQuestionById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args): Promise<QuestionVariant | null> => {
    const question = await ctx.db.get(args.id);
    if (!question) return null;

    // Get answers to compute displayPrivacy
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_questionId", (idx) => idx.eq("questionId", question._id))
      .collect();

    const answerPrivacies = answers.map((a) => a.privacy);
    const displayPrivacy = computeDisplayPrivacy(
      question.privacy,
      answerPrivacies
    );

    const askedDate = new Date(question._creationTime).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" }
    );

    const base = { ...question, askedDate, displayPrivacy };

    // Determine variant based on questionType and status
    if (question.questionType === "recurring" && question.schedule) {
      return {
        ...base,
        variant: "recurring" as const,
        frequency: question.schedule.frequency,
        scheduledDate: new Date(
          question.schedule.deliveryDate
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    }

    if (question.status === "in-progress") {
      return {
        ...base,
        variant: "in-progress" as const,
      };
    }

    // Completed (answered) - get tableData from first answer
    const firstAnswerWithTable = answers.find((a) => a.tableData);
    return {
      ...base,
      variant: "answered" as const,
      tableData: (firstAnswerWithTable?.tableData ?? []) as TableRow[],
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
      .withIndex("by_questionId", (idx) => idx.eq("questionId", args.id))
      .collect();

    // Update each answer atomically
    await Promise.all(
      answers.map((answer) =>
        ctx.db.patch(answer._id, { privacy: args.privacy })
      )
    );
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
