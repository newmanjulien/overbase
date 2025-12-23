import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all templates with resolved image URLs
export const getAllTemplates = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("templates").collect();

    // Resolve image URLs from storage IDs
    const templatesWithImages = await Promise.all(
      templates.map(async (template) => {
        let imageUrl: string | null = null;
        if (template.imageId) {
          imageUrl = await ctx.storage.getUrl(template.imageId);
        }
        return {
          ...template,
          imageUrl,
        };
      })
    );

    return templatesWithImages;
  },
});

// Get templates filtered by tag
export const getTemplatesByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    const templates = await ctx.db.query("templates").collect();
    const filtered = templates.filter((template) =>
      template.tags.includes(args.tag)
    );

    // Resolve image URLs from storage IDs
    const templatesWithImages = await Promise.all(
      filtered.map(async (template) => {
        let imageUrl: string | null = null;
        if (template.imageId) {
          imageUrl = await ctx.storage.getUrl(template.imageId);
        }
        return {
          ...template,
          imageUrl,
        };
      })
    );

    return templatesWithImages;
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
