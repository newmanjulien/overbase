"use client";

import { QuestionCardShell } from "./QuestionCardShell";
import { StatusPill } from "./StatusPill";
import type { InProgressQuestion, Privacy } from "@/lib/questions";
import type { Id } from "@convex/_generated/dataModel";

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
