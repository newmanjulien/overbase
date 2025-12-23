"use client";

import { Lock, Users } from "lucide-react";
import DataTable, { TableRow } from "@/components/blocks/DataTable";

export interface QuestionType {
  id: number;
  askedDate: string;
  title?: string;
  content: string;
  tableData?: TableRow[];
  status: "in-progress" | "completed";
  privacy: "private" | "team";
}

interface QuestionCardProps {
  question: QuestionType;
  onPrivacyChange?: (
    questionId: number,
    newPrivacy: "private" | "team"
  ) => void;
  onForward?: () => void;
}

export default function QuestionCard({
  question,
  onPrivacyChange,
  onForward,
}: QuestionCardProps) {
  const handleCardClick = () => {
    window.open(`/dashboard/answers/${question.id}`, "_blank");
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const newPrivacy = question.privacy === "private" ? "team" : "private";
    onPrivacyChange?.(question.id, newPrivacy);
  };

  return (
    <div
      onClick={handleCardClick}
      className="block bg-white rounded-2xl border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader question={question} onPrivacyClick={handlePrivacyClick} />

      {question.tableData && (
        <DataTable tableData={question.tableData} onForward={onForward} />
      )}
    </div>
  );
}

// -------------------- Subcomponents --------------------

function CardHeader({
  question,
  onPrivacyClick,
}: {
  question: QuestionType;
  onPrivacyClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          Asked on {question.askedDate}
          <span className="text-gray-400">·</span>
          <button
            type="button"
            onClick={onPrivacyClick}
            className="text-gray-400 capitalize hover:underline cursor-pointer flex items-center gap-1"
          >
            {question.privacy === "private" ? (
              <Lock size={12} className="shrink-0" />
            ) : (
              <Users size={12} className="shrink-0" />
            )}
            {question.privacy}
          </button>
        </span>
        {question.status === "in-progress" && (
          <span
            className="px-2 py-1 rounded-lg text-xs text-gray-800"
            style={{ backgroundColor: "#FFFF00" }}
          >
            In Progress
          </span>
        )}
      </div>
      {question.title && (
        <h2 className="text-gray-800 mb-2">{question.title}</h2>
      )}
      <p className="text-gray-600 text-sm line-clamp-2 overflow-hidden">
        {question.content}
      </p>
    </div>
  );
}
