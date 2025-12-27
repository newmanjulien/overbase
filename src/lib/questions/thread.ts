/**
 * Thread Derivation
 *
 * Pure function to compute a unified thread of display cards from
 * a question and its answers. This centralizes all card logic in
 * one place, making Answer.tsx a simple renderer.
 */

import type { Privacy, Sender } from "./constants";
import { SENDER } from "./constants";
import type {
  QuestionVariant,
  TableRow,
  KpiAttachment,
  PersonReference,
  FileAttachment,
  ConnectorReference,
} from "./types";

// ============================================
// THREAD CARD TYPES
// ============================================

/** The original user question */
export type QuestionCard = {
  type: "question";
  content: string;
  date: string;
  privacy: Privacy;
  // Attachments from the original question
  attachedKpis?: KpiAttachment[];
  attachedPeople?: PersonReference[];
  attachedFiles?: FileAttachment[];
  attachedConnectors?: ConnectorReference[];
};

/** A response in the thread (from user or Overbase) */
export type AnswerCard = {
  type: "response";
  answerId: string;
  sender: Sender;
  content: string;
  privacy: Privacy;
  tableData?: TableRow[];
  showMenu?: boolean;
  // Attachments (only populated for user messages)
  attachedKpis?: KpiAttachment[];
  attachedPeople?: PersonReference[];
  attachedFiles?: FileAttachment[];
  attachedConnectors?: ConnectorReference[];
};

/** A status/placeholder card (e.g., "Overbase is answering...") */
export type StatusCard = {
  type: "status";
  label: string;
  subLabel?: string;
  avatar: "overbase";
};

/** An informational card (e.g., "48h wait time") */
export type InfoCard = {
  type: "info";
  text: string;
  href?: string;
  linkText?: string;
};

/** Discriminated union of all possible thread cards */
export type ThreadCard = QuestionCard | AnswerCard | StatusCard | InfoCard;

// ============================================
// ANSWER TYPE (minimal shape we need)
// ============================================

/**
 * Minimal Answer shape for deriveThread.
 * This avoids importing from page-specific types.
 * Fields are optional to match actual Convex response.
 */
export interface ThreadAnswer {
  _id: string;
  sender: Sender;
  content?: string;
  privacy: Privacy;
  tableData?: TableRow[];
  cancelledAt?: number;
  // Attachments (from answers table)
  attachedKpis?: KpiAttachment[];
  attachedPeople?: PersonReference[];
  attachedFiles?: FileAttachment[];
  attachedConnectors?: ConnectorReference[];
}

// ============================================
// DERIVE THREAD FUNCTION
// ============================================

/**
 * Computes the full display thread from a question and its answers.
 *
 * The thread includes:
 * 1. The original question card
 * 2. All answer cards (skipping the first answer, which IS the question)
 * 3. "Overbase is answering..." if awaiting response (last message from user)
 * 4. "Next answer on..." for recurring questions
 * 5. Info card for in-progress questions
 *
 * @param question - The enriched question variant
 * @param answers - Array of answers (first answer is the question content)
 * @returns Array of ThreadCards ready for rendering
 */
export function deriveThread(
  question: QuestionVariant | undefined,
  answers: ThreadAnswer[]
): ThreadCard[] {
  if (!question) {
    return [];
  }

  const thread: ThreadCard[] = [];

  // Filter out cancelled answers
  const activeAnswers = answers.filter((a) => !a.cancelledAt);

  // Determine if we're awaiting response (for status card and showMenu)
  const lastAnswer = activeAnswers[activeAnswers.length - 1];
  const isAwaitingResponse = lastAnswer?.sender === SENDER.USER;
  const isRecurringWithSingleQuestion =
    question.isRecurring && activeAnswers.length === 1;
  const shouldShowMenu = isAwaitingResponse && !isRecurringWithSingleQuestion;

  // 1. Original question card (with attachments from first answer)
  const firstAnswer = activeAnswers[0];
  thread.push({
    type: "question",
    content: question.displayContent,
    date: question.askedDate,
    privacy: question.displayPrivacy,
    attachedKpis: firstAnswer?.attachedKpis,
    attachedPeople: firstAnswer?.attachedPeople,
    attachedFiles: firstAnswer?.attachedFiles,
    attachedConnectors: firstAnswer?.attachedConnectors,
  });

  // 2. Answer cards (skip first - it's the question itself)
  const answerCards = activeAnswers.slice(1);
  for (let i = 0; i < answerCards.length; i++) {
    const answer = answerCards[i];
    const isLastAnswerCard = i === answerCards.length - 1;
    thread.push({
      type: "response",
      answerId: answer._id,
      sender: answer.sender,
      content: answer.content ?? "",
      privacy: answer.privacy,
      tableData: answer.tableData,
      // Show menu only on the last answer card when it's from user and awaiting response
      showMenu: isLastAnswerCard && shouldShowMenu,
      // Pass attachments only for user messages
      ...(answer.sender === SENDER.USER && {
        attachedKpis: answer.attachedKpis,
        attachedPeople: answer.attachedPeople,
        attachedFiles: answer.attachedFiles,
        attachedConnectors: answer.attachedConnectors,
      }),
    });
  }

  // 3. "Overbase is answering..." - show when awaiting response
  // (uses variables already computed above)
  if (isAwaitingResponse && !isRecurringWithSingleQuestion) {
    thread.push({
      type: "status",
      label: "Overbase is answering...",
      avatar: "overbase",
    });
  }

  // 4. Recurring: show next scheduled answer date
  if (question.variant === "recurring") {
    thread.push({
      type: "status",
      label: `Next answer will be on ${question.scheduledDate}`,
      avatar: "overbase",
    });
  }

  // 5. Info card for in-progress questions
  if (question.variant === "in-progress") {
    thread.push({
      type: "info",
      text: "It can take up to 48h for our AI agents to answer in depth and accurately",
      linkText: "See how our AI agents work",
      href: "#",
    });
  }

  return thread;
}
