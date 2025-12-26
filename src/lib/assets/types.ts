/**
 * Shared Asset Types
 *
 * These types are used by both client components and Convex server code.
 * This file contains only types - no runtime code that would cause
 * issues when imported in the browser.
 */

import type { Doc } from "@convex/_generated/dataModel";

// ============================================
// ASSET TYPES
// ============================================

/** App asset with resolved image URL */
export type AppAssetWithUrl = Doc<"appAssets"> & {
  imageUrl: string | null;
};
