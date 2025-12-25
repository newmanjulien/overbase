/**
 * Centralized Privacy Logic for Questions & Answers
 *
 * RULES:
 * 1. When question privacy changes → cascade to ALL child answers
 * 2. Question's DISPLAY privacy = "team" if ANY answer is "team", else "private"
 * 3. Individual answer privacy can be changed independently
 * 4. Frontend always uses displayPrivacy for questions (computed, not stored)
 */

// ============================================
// TYPES
// ============================================

export type PrivacyValue = "private" | "team";

/** Question with computed display privacy */
export interface QuestionWithDisplayPrivacy {
  privacy: PrivacyValue; // Stored value
  displayPrivacy: PrivacyValue; // Computed: most permissive across question + answers
}

// ============================================
// PRIVACY COMPUTATION
// ============================================

/**
 * Compute the display privacy for a question based on its answers.
 *
 * Rule: If ANY answer is "team", display "team". Otherwise, display "private".
 *
 * @param questionPrivacy - The stored privacy value of the question
 * @param answerPrivacies - Array of privacy values from all child answers
 * @returns The privacy value to display on the question card
 */
export function computeDisplayPrivacy(
  questionPrivacy: PrivacyValue,
  answerPrivacies: PrivacyValue[]
): PrivacyValue {
  // If the question itself is "team", display is "team"
  if (questionPrivacy === "team") {
    return "team";
  }

  // If any answer is "team", display is "team"
  const hasTeamAnswer = answerPrivacies.some((p) => p === "team");
  if (hasTeamAnswer) {
    return "team";
  }

  // All are private
  return "private";
}

/**
 * Determine if all privacies are the same value.
 * Useful for checking if cascade is complete.
 */
export function allPrivaciesMatch(
  target: PrivacyValue,
  privacies: PrivacyValue[]
): boolean {
  return privacies.every((p) => p === target);
}
