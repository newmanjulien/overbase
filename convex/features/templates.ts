import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";

/** Template with resolved image URL */
export type TemplateWithImage = Doc<"templates"> & {
  imageUrl: string | null;
};

// Get all templates with resolved image URLs
export const getAllTemplates = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("templates"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      tags: v.array(v.string()),
      gradient: v.string(),
      imageId: v.optional(v.id("_storage")),
      imageUrl: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx): Promise<TemplateWithImage[]> => {
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
  returns: v.array(
    v.object({
      _id: v.id("templates"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      tags: v.array(v.string()),
      gradient: v.string(),
      imageId: v.optional(v.id("_storage")),
      imageUrl: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx, args): Promise<TemplateWithImage[]> => {
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
  returns: v.array(v.string()),
  handler: async (ctx): Promise<string[]> => {
    const templates = await ctx.db.query("templates").collect();
    const allTags = templates.flatMap((t) => t.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  },
});
