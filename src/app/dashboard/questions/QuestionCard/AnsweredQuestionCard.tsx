"use client";

import { QuestionCardShell } from "./QuestionCardShell";
import DataTable from "@/components/blocks/DataTable";
import type { AnsweredQuestion } from "@/lib/questions";
import type { Id } from "@convex/_generated/dataModel";

interface AnsweredQuestionCardProps {
  question: AnsweredQuestion;
  onPrivacyChange?: (
    questionId: Id<"questions">,
    newPrivacy: "private" | "team"
  ) => void;
}

export function AnsweredQuestionCard({
  question,
  onPrivacyChange,
}: AnsweredQuestionCardProps) {
  return (
    <QuestionCardShell
      questionId={question._id}
      displayPrivacy={question.displayPrivacy}
      onPrivacyChange={onPrivacyChange}
      dateLabel={`Asked on ${question.askedDate}`}
    >
      <p className="text-gray-600 text-sm line-clamp-2 overflow-hidden">
        {question.displayContent}
      </p>

      {question.tableData.length > 0 && (
        <div className="mt-3 -mx-4 -mb-4">
          <DataTable tableData={question.tableData} />
        </div>
      )}
    </QuestionCardShell>
  );
}
