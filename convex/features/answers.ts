import { query } from "../_generated/server";
// import { v } from "convex/values";

// ============================================
// ANSWERS FEATURE
// Handles both questions and their answers
// ============================================

// Get all questions
export const getAllQuestions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("questions").collect();
  },
});

// TODO: Add more queries as needed
// - getQuestionById
// - getAnswersByQuestionId
// - getQuestionsByStatus
