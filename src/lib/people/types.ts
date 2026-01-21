/**
 * People Types
 *
 * Re-exports storage types from Convex and defines UI-specific extensions.
 * Safe to import in both client and server code.
 */

import type { PersonDoc } from "@convex/types";

// ============================================
// RE-EXPORT STORAGE TYPES FROM CONVEX
// ============================================

/** Database person document */
export type DbPerson = PersonDoc;

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
