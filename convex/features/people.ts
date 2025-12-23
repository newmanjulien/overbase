import { query } from "../_generated/server";
// import { v } from "convex/values";

// ============================================
// PEOPLE FEATURE
// ============================================

// Get all people
export const getAllPeople = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("people").collect();
  },
});

// TODO: Add more queries as needed
// - getPersonById
// - getPeopleByStatus
