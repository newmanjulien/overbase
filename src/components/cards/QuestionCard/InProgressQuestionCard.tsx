"use client";

import { QuestionCardShell } from "./QuestionCardShell";
import { StatusPill } from "@/components/blocks/StatusPill";
import type { InProgressQuestion, Privacy, Id } from "@/lib/questions";

interface InProgressQuestionCardProps {
  question: InProgressQuestion;
  onPrivacyChange?: (questionId: Id<"questions">, newPrivacy: Privacy) => void;
}

export function InProgressQuestionCard({
  question,
  onPrivacyChange,
}: InProgressQuestionCardProps) {
  return (
    <QuestionCardShell
      questionId={question._id}
      displayPrivacy={question.displayPrivacy}
      onPrivacyChange={onPrivacyChange}
      dateLabel={`Asked on ${question.askedDate}`}
      headerRight={<StatusPill label="In Progress" color="yellow" />}
      showMenu
    >
      <p className="text-gray-600 text-sm line-clamp-2 overflow-hidden">
        {question.displayContent}
      </p>
    </QuestionCardShell>
  );
}
