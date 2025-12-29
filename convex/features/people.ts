import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

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

// Add a new person
export const addPerson = mutation({
  args: { name: v.string(), photo: v.optional(v.string()) },
  handler: async (ctx, { name, photo }) => {
    return await ctx.db.insert("people", {
      name,
      photo,
      status: "ready",
    });
  },
});

// Delete a single person
export const deletePerson = mutation({
  args: { id: v.id("people") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Delete multiple people
export const deletePeople = mutation({
  args: { ids: v.array(v.id("people")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
  },
});
