/**
 * Modal types - combines Convex types with UI-specific extensions.
 *
 * Core attachment types are re-exported from convex/shared/attachmentTypes.ts.
 * UI-specific types that depend on browser APIs (like File) or modal-specific
 * logic are defined here.
 */

// Re-export core attachment types from Convex shared
export type {
  KpiAttachment,
  PersonAttachment,
  PersonEntry,
  FileAttachment,
} from "@convex/shared/attachmentTypes";

// ============================================
// UI-SPECIFIC TYPES
// ============================================

/**
 * Extended person attachment with additional modal context.
 * Used in PeopleModal for tracking what info is needed from each person.
 */
export interface PersonAttachmentWithInfo {
  name: string;
  infoNeeded: string;
}

/**
 * Forward entry with additional forward-specific fields.
 * Used in ForwardModal for tracking forward options.
 */
export interface ForwardEntry {
  name: string;
  infoNeeded: string;
  selectionType: string;
}

/**
 * Extended file attachment with the actual File object for upload.
 * Used in FileModal before the file is uploaded to storage.
 */
export interface FileAttachmentForUpload {
  file: File | null;
  fileName: string;
  context: string;
}

// Re-export dummy data for convenience
export { dummyPeople } from "./dummyPeople";
