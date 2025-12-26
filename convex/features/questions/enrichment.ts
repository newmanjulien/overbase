/**
 * Question Enrichment - Server-side query helpers
 *
 * These are NOT exported to the API - used for query composition.
 * Converts raw database documents into enriched QuestionVariant types.
 */

import type { QueryCtx } from "@convex/_generated/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import {
  computeDisplayPrivacy,
  getNextDeliveryDate,
  SENDER,
  type Privacy,
  type QuestionVariant,
  type TableRow,
} from "@/lib/questions";

/**
 * Format a timestamp as a human-readable date string.
 */
export function formatAskedDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Fetch all answers for multiple questions in a single query.
 * Returns a Map for O(1) lookup by questionThreadId.
 */
export async function fetchAnswersForQuestions(
  ctx: QueryCtx,
  questionIds: Id<"questions">[]
): Promise<Map<Id<"questions">, Doc<"answers">[]>> {
  // Fetch ALL answers in one query (ordered by creation time)
  const allAnswers = await ctx.db.query("answers").order("asc").collect();

  // Group by questionThreadId
  const answersByQuestion = new Map<Id<"questions">, Doc<"answers">[]>();

  // Initialize empty arrays for all question IDs
  for (const id of questionIds) {
    answersByQuestion.set(id, []);
  }

  // Distribute answers to their questions
  for (const answer of allAnswers) {
    const existing = answersByQuestion.get(answer.questionThreadId);
    if (existing) {
      existing.push(answer);
    }
  }

  return answersByQuestion;
}

/**
 * Enrich a single question with its answers (already fetched).
 * Use this when you already have the answers pre-fetched.
 */
export function enrichQuestionWithAnswers(
  question: Doc<"questions">,
  answers: Doc<"answers">[]
): QuestionVariant {
  // If no answers, return minimal data
  if (answers.length === 0) {
    return {
      ...question,
      displayContent: "",
      askedDate: formatAskedDate(question._creationTime),
      askedTimestamp: question._creationTime,
      status: "in-progress",
      displayPrivacy: question.privacy,
      isRecurring: question.schedule !== undefined,
      variant: "in-progress" as const,
    };
  }

  // First answer = original question from user
  const firstAnswer = answers[0];

  // Last answer determines status
  const lastAnswer = answers[answers.length - 1];
  const status: "in-progress" | "completed" =
    lastAnswer.sender === SENDER.USER ? "in-progress" : "completed";

  // Find last Overbase answer for tableData
  const lastOverbaseAnswer = [...answers]
    .reverse()
    .find((a) => a.sender === SENDER.OVERBASE);

  // Compute display privacy from question + all answers
  const answerPrivacies = answers.map((a) => a.privacy) as Privacy[];
  const displayPrivacy = computeDisplayPrivacy(
    question.privacy,
    answerPrivacies
  );

  // Format dates from first answer (the original question)
  const askedDate = formatAskedDate(firstAnswer._creationTime);
  const askedTimestamp = firstAnswer._creationTime;

  // Is this recurring?
  const isRecurring = question.schedule !== undefined;

  // Build base object with computed fields
  const base = {
    ...question,
    displayContent: firstAnswer.content ?? "",
    askedDate,
    askedTimestamp,
    status,
    displayPrivacy,
    isRecurring,
  };

  // Determine variant based on schedule and status
  if (isRecurring && question.schedule) {
    const nextDate = getNextDeliveryDate(question.schedule);
    return {
      ...base,
      variant: "recurring" as const,
      frequency: question.schedule.frequency,
      scheduledDate: formatAskedDate(nextDate.getTime()),
    };
  }

  if (status === "in-progress") {
    return {
      ...base,
      variant: "in-progress" as const,
    };
  }

  // Completed (answered) - get tableData from LAST Overbase answer
  return {
    ...base,
    variant: "answered" as const,
    tableData: (lastOverbaseAnswer?.tableData ?? []) as TableRow[],
  };
}

/**
 * Enrich multiple questions efficiently (batch operation).
 * Fetches all answers once, then enriches each question.
 */
export async function enrichQuestionsWithVariants(
  ctx: QueryCtx,
  questions: Doc<"questions">[]
): Promise<QuestionVariant[]> {
  if (questions.length === 0) return [];

  // Batch fetch all answers
  const questionIds = questions.map((q) => q._id);
  const answersByQuestion = await fetchAnswersForQuestions(ctx, questionIds);

  // Enrich each question with its pre-fetched answers
  return questions.map((question) => {
    const answers = answersByQuestion.get(question._id) ?? [];
    return enrichQuestionWithAnswers(question, answers);
  });
}

/**
 * Enrich a single question (fetches its answers).
 * Use enrichQuestionsWithVariants for multiple questions to avoid N+1.
 */
export async function enrichQuestionWithVariant(
  ctx: QueryCtx,
  question: Doc<"questions">
): Promise<QuestionVariant> {
  const answers = await ctx.db
    .query("answers")
    .withIndex("by_questionThreadId", (idx) =>
      idx.eq("questionThreadId", question._id)
    )
    .order("asc")
    .collect();

  return enrichQuestionWithAnswers(question, answers);
}
