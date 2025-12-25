import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";

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

/** Current user with resolved avatar URL */
export type CurrentUserWithAvatar = Doc<"currentUser"> & {
  avatarUrl: string | null;
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

/**
 * Get the current user with resolved avatar URL.
 * For now, returns the first user in the table (singleton pattern).
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<CurrentUserWithAvatar | null> => {
    const user = await ctx.db.query("currentUser").first();
    if (!user) return null;

    let avatarUrl: string | null = null;
    if (user.avatarId) {
      avatarUrl = await ctx.storage.getUrl(user.avatarId);
    }

    return {
      ...user,
      avatarUrl,
    };
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

/**
 * Create or update the current user profile.
 */
export const upsertCurrentUser = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    avatarId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("currentUser").first();

    if (existing) {
      // Delete old avatar from storage if different and new one provided
      if (
        args.avatarId &&
        existing.avatarId &&
        existing.avatarId !== args.avatarId
      ) {
        await ctx.storage.delete(existing.avatarId);
      }
      // Update existing user
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        avatarId: args.avatarId,
      });
      return existing._id;
    } else {
      // Create new user
      return await ctx.db.insert("currentUser", {
        name: args.name,
        email: args.email,
        avatarId: args.avatarId,
      });
    }
  },
});

/**
 * Update just the current user's avatar.
 */
export const updateCurrentUserAvatar = mutation({
  args: {
    avatarId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("currentUser").first();

    if (existing) {
      // Delete old avatar if exists
      if (existing.avatarId) {
        await ctx.storage.delete(existing.avatarId);
      }
      await ctx.db.patch(existing._id, { avatarId: args.avatarId });
      return existing._id;
    } else {
      // Create user with just avatar (requires name though)
      return await ctx.db.insert("currentUser", {
        name: "User",
        avatarId: args.avatarId,
      });
    }
  },
});
