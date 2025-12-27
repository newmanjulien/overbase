/**
 * Modal types - UI-specific extensions for question-related modals.
 *
 * Core types are imported from the shared types library.
 * UI-specific types that depend on browser APIs (like File) or
 * modal-specific logic are defined here.
 */

// Re-export core types from shared library for convenience
export type {
  KpiAttachment,
  PersonReference,
  FileAttachment,
} from "@/lib/questions";

// ============================================
// UI-SPECIFIC TYPES
// ============================================

/**
 * Extended person reference with additional modal context.
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

/**
 * Connector attachment for questions/answers.
 * References a connector the user wants Overbase to query.
 */
export interface ConnectorAttachment {
  id: string;
  title: string;
  logo: string;
}

// Re-export dummy data for convenience
export { dummyPeople } from "./dummyPeople";
