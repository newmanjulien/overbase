/**
 * People Module - Barrel Export
 *
 * Re-exports all people-related types and helpers.
 * Safe to import in both client and server code.
 */

// Types
export type { PersonReference } from "./types";

// Helpers
export { toPersonReferences } from "./helpers";
