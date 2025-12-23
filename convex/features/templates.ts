import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all templates
export const getAllTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("templates").collect();
  },
});

// Get templates filtered by tag
export const getTemplatesByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    const allTemplates = await ctx.db.query("templates").collect();
    return allTemplates.filter((template) => template.tags.includes(args.tag));
  },
});

// Get all tag configurations
export const getAllTags = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tagsConfig").collect();
  },
});

// Get a single tag by key
export const getTagByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tagsConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});
