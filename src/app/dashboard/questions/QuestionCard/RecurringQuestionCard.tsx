"use client";

import { QuestionCardShell } from "./QuestionCardShell";
import { StatusPill } from "./StatusPill";
import type { RecurringQuestion, Privacy } from "@/lib/questions";
import { FREQUENCY_LABEL } from "@/lib/questions";
import type { Id } from "@convex/_generated/dataModel";

interface RecurringQuestionCardProps {
  question: RecurringQuestion;
  onPrivacyChange?: (questionId: Id<"questions">, newPrivacy: Privacy) => void;
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
        <StatusPill label={FREQUENCY_LABEL[question.frequency]} color="red" />
      }
      showMenu
    >
      <p className="text-gray-600 text-sm line-clamp-2 overflow-hidden">
        {question.displayContent}
      </p>
    </QuestionCardShell>
  );
}
