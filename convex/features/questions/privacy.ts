/**
 * Privacy Logic — SINGLE POINT OF CONTROL
 *
 * ALL privacy changes MUST go through these functions.
 * Direct db.patch on privacy fields is FORBIDDEN.
 *
 * RULES:
 * 1. Question privacy change → cascades to ALL answers
 * 2. Answer privacy change → ONLY that answer changes
 * 3. After any answer change, question privacy = MAX(all answers)
 *    where team > private
 */

import type { MutationCtx } from "@convex/_generated/server";
import type { Id } from "@convex/_generated/dataModel";
import type { Privacy } from "@/lib/questions";

// ============================================
// PUBLIC API — Use these in mutations
// ============================================

/**
 * Set privacy on a question and cascade to all its answers.
 *
 * Rule 1: Question privacy change → all answers change
 */
export async function setQuestionPrivacy(
  ctx: MutationCtx,
  questionId: Id<"questions">,
  privacy: Privacy
): Promise<void> {
  // Update the question
  await ctx.db.patch(questionId, { privacy });

  // Cascade to all answers
  await _cascadeToAnswers(ctx, questionId, privacy);
}

/**
 * Set privacy on a single answer, then recompute question privacy.
 *
 * Rule 2: Answer privacy change → only that answer changes
 * Rule 3: Question = MAX(all answers) after any answer change
 */
export async function setAnswerPrivacy(
  ctx: MutationCtx,
  answerId: Id<"answers">,
  privacy: Privacy
): Promise<void> {
  // Get the answer to find its parent question
  const answer = await ctx.db.get(answerId);
  if (!answer) return;

  // Update only this answer
  await ctx.db.patch(answerId, { privacy });

  // Recompute question privacy from all answers
  await _recomputeQuestionFromAnswers(ctx, answer.questionThreadId);
}

// ============================================
// INTERNAL — Do not call directly
// ============================================

/**
 * Set all answers under a question to the same privacy.
 * Called when question privacy changes.
 */
async function _cascadeToAnswers(
  ctx: MutationCtx,
  questionId: Id<"questions">,
  privacy: Privacy
): Promise<void> {
  const answers = await ctx.db
    .query("answers")
    .withIndex("by_questionThreadId", (idx) =>
      idx.eq("questionThreadId", questionId)
    )
    .collect();

  await Promise.all(answers.map((a) => ctx.db.patch(a._id, { privacy })));
}

/**
 * Recompute question privacy as MAX(all answer privacies).
 * team > private, so if ANY answer is team, question is team.
 */
async function _recomputeQuestionFromAnswers(
  ctx: MutationCtx,
  questionId: Id<"questions">
): Promise<void> {
  const answers = await ctx.db
    .query("answers")
    .withIndex("by_questionThreadId", (idx) =>
      idx.eq("questionThreadId", questionId)
    )
    .collect();

  const hasTeamAnswer = answers.some((a) => a.privacy === "team");
  await ctx.db.patch(questionId, {
    privacy: hasTeamAnswer ? "team" : "private",
  });
}
