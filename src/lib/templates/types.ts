/**
 * Shared Template Types
 *
 * These types are used by both client components and Convex server code.
 * This file contains only types - no runtime code.
 */

import type { Doc } from "@convex/_generated/dataModel";

// ============================================
// TEMPLATE TYPES
// ============================================

/** Template with resolved image URL */
export type TemplateWithImage = Doc<"templates"> & {
  imageUrl: string | null;
};
