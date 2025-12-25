/**
 * Shared attachment types for questions.
 * These are the canonical shapes that match the Convex schema.
 * All UI components should derive from or use these types.
 */

// ============================================
// ATTACHMENT TYPES (match schema.ts)
// ============================================

/**
 * KPI attachment shape as stored in Convex.
 */
export interface KpiAttachment {
  metric: string;
  definition: string;
  antiDefinition: string;
}

/**
 * Person attachment shape as stored in Convex.
 * Note: This is for attaching people to a question, not for people lookup.
 */
export interface PersonAttachment {
  id: string;
  name: string;
}

/**
 * File attachment shape as stored in Convex.
 */
export interface FileAttachment {
  fileName: string;
  context?: string;
  // Future: fileId?: Id<"_storage">;
}

// ============================================
// PEOPLE LOOKUP TYPES
// ============================================

/**
 * Person entry for lookup/selection (from people table or dummy data).
 * Used by PeopleModal and ForwardModal for displaying available people.
 */
export interface PersonEntry {
  id: string;
  name: string;
}
