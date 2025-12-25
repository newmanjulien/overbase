/**
 * Base tags that should always appear in the sidebar.
 * These are the canonical source of truth for question tags.
 * Each tag includes its empty state messaging for the UI.
 */
export const BASE_QUESTION_TAGS = [
  {
    key: "Asked this week",
    emptyTitle: "No questions this week",
    emptyDescription: "You haven't asked any questions this week yet.",
  },
  {
    key: "Asked this month",
    emptyTitle: "No questions this month",
    emptyDescription: "You haven't asked any questions this month yet.",
  },
  {
    key: "Recurring questions",
    emptyTitle: "No recurring questions",
    emptyDescription: "Set up recurring questions to get regular updates.",
  },
  {
    key: "All answers",
    emptyTitle: "No questions yet",
    emptyDescription: "Ask your first question to get started!",
  },
] as const;

/** Just the tag keys (for backward compatibility) */
export const BASE_QUESTION_TAG_KEYS = BASE_QUESTION_TAGS.map((t) => t.key);

export type QuestionTag = (typeof BASE_QUESTION_TAGS)[number]["key"];
