/**
 * Question Helpers
 *
 * Pure functions for computing question-related values.
 * These can be used by both client and server code.
 */

import { PRIVACY, type Privacy } from "./constants";

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
  questionPrivacy: Privacy,
  answerPrivacies: Privacy[]
): Privacy {
  // If the question itself is "team", display is "team"
  if (questionPrivacy === PRIVACY.TEAM) {
    return PRIVACY.TEAM;
  }

  // If any answer is "team", display is "team"
  const hasTeamAnswer = answerPrivacies.some((p) => p === PRIVACY.TEAM);
  if (hasTeamAnswer) {
    return PRIVACY.TEAM;
  }

  // All are private
  return PRIVACY.PRIVATE;
}
