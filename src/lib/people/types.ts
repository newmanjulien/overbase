/**
 * People Types
 *
 * Re-exports storage types from Convex and defines UI-specific extensions.
 * Safe to import in both client and server code.
 */

import type { Doc } from "@convex/_generated/dataModel";

// ============================================
// RE-EXPORT STORAGE TYPES FROM CONVEX
// ============================================

/** Database person document */
export type DbPerson = Doc<"people">;

// ============================================
// UI-EXTENDED TYPES
// ============================================

/**
 * Person reference for UI components.
 * Matches the shape expected by chips, modals, etc.
 */
export interface PersonReference {
  id: string;
  name: string;
  photo?: string;
}
