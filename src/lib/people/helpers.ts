/**
 * People Helpers
 *
 * Runtime utilities for transforming people data.
 * Uses stable empty array to prevent React re-render issues.
 */

import type { DbPerson, PersonReference } from "./types";

// ============================================
// STABLE EMPTY REFERENCES
// ============================================

/** Stable empty array - prevents new reference on each render */
const EMPTY_PEOPLE: PersonReference[] = [];

// ============================================
// TRANSFORMATION HELPERS
// ============================================

/**
 * Transform database people to PersonReference[].
 * Returns stable empty array if input is undefined (loading state).
 *
 * Usage in components:
 * ```
 * const dbPeople = useQuery(api.features.people.getAllPeople);
 * const allPeople = toPersonReferences(dbPeople);
 * ```
 */
export function toPersonReferences(
  dbPeople: DbPerson[] | undefined
): PersonReference[] {
  if (!dbPeople) return EMPTY_PEOPLE;
  return dbPeople.map((p) => ({
    id: p._id,
    name: p.name,
    photo: p.photo,
  }));
}
