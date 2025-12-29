import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";

// ============================================
// ASSET KEYS
// Keep these in sync with the seeded data in Convex.
// ============================================

export const ASSET_KEYS = {
  OVERBASE_ICON: "overbase-icon",
  OVERBASE_LOGO: "overbase-logo",
  USER_AVATAR: "user-avatar",
} as const;

export type AssetKey = (typeof ASSET_KEYS)[keyof typeof ASSET_KEYS];

// ============================================
// APP ASSETS FEATURE
// Handles branding images stored in Convex file storage
// ============================================

// --------------------------------------------
// TYPES
// --------------------------------------------

/** App asset with resolved image URL */
export type AppAssetWithUrl = Doc<"appAssets"> & {
  imageUrl: string | null;
};

// --------------------------------------------
// QUERIES
// --------------------------------------------

/**
 * Get a single app asset by its unique key.
 * This is used to fetch branding images like the Overbase logo.
 */
export const getAssetByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args): Promise<AppAssetWithUrl | null> => {
    const asset = await ctx.db
      .query("appAssets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!asset) return null;

    const imageUrl = await ctx.storage.getUrl(asset.imageId);
    return {
      ...asset,
      imageUrl,
    };
  },
});

/**
 * Get all app assets with resolved URLs.
 */
export const getAllAssets = query({
  args: {},
  handler: async (ctx): Promise<AppAssetWithUrl[]> => {
    const assets = await ctx.db.query("appAssets").collect();

    const assetsWithUrls = await Promise.all(
      assets.map(async (asset) => {
        const imageUrl = await ctx.storage.getUrl(asset.imageId);
        return { ...asset, imageUrl };
      })
    );

    return assetsWithUrls;
  },
});

// --------------------------------------------
// MUTATIONS
// --------------------------------------------

/**
 * Generate an upload URL for app assets.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Create or update an app asset.
 * If an asset with the same key exists, it updates it; otherwise creates new.
 */
export const upsertAppAsset = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Check if asset with this key already exists
    const existing = await ctx.db
      .query("appAssets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      // Delete old image from storage if different
      if (existing.imageId !== args.imageId) {
        await ctx.storage.delete(existing.imageId);
      }
      // Update existing asset
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageId: args.imageId,
      });
      return existing._id;
    } else {
      // Create new asset
      return await ctx.db.insert("appAssets", {
        key: args.key,
        name: args.name,
        imageId: args.imageId,
      });
    }
  },
});
