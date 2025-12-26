/**
 * Asset Constants
 *
 * These constants define the keys for app assets stored in Convex.
 * Safe to import in both client and server code.
 */

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
