"use client";

import { QuestionCardShell } from "./QuestionCardShell";
import { StatusPill } from "./StatusPill";
import type { RecurringQuestion } from "@/lib/questions";
import type { Id } from "@convex/_generated/dataModel";

interface RecurringQuestionCardProps {
  question: RecurringQuestion;
  onPrivacyChange?: (
    questionId: Id<"questions">,
    newPrivacy: "private" | "team"
  ) => void;
}

/** Capitalize first letter of frequency for display */
function formatFrequency(freq: "weekly" | "monthly" | "quarterly"): string {
  return freq.charAt(0).toUpperCase() + freq.slice(1);
}

export function RecurringQuestionCard({
  question,
  onPrivacyChange,
}: RecurringQuestionCardProps) {
  return (
    <QuestionCardShell
      questionId={question._id}
      displayPrivacy={question.displayPrivacy}
      onPrivacyChange={onPrivacyChange}
      dateLabel={`Next answer on ${question.scheduledDate}`}
      headerRight={
        <StatusPill label={formatFrequency(question.frequency)} color="red" />
      }
      showMenu
    >
      <p className="text-gray-600 text-sm line-clamp-2 overflow-hidden">
        {question.displayContent}
      </p>
    </QuestionCardShell>
  );
}
