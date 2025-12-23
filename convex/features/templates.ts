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

// Get unique tags derived from all templates
export const getUniqueTags = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("templates").collect();
    const allTags = templates.flatMap((t) => t.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  },
});
