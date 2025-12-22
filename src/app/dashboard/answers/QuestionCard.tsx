"use client";

import DataTable, { TableRow } from "@/components/blocks/DataTable";

export interface QuestionType {
  id: number;
  askedDate: string;
  title?: string;
  content: string;
  tableData?: TableRow[];
  status: "in-progress" | "completed";
}

interface QuestionCardProps {
  question: QuestionType;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const handleCardClick = () => {
    window.open(`/dashboard/answers/${question.id}`, "_blank");
  };

  return (
    <div
      onClick={handleCardClick}
      className="block bg-white rounded-2xl border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader question={question} />

      {question.tableData && <DataTable tableData={question.tableData} />}
    </div>
  );
}

// -------------------- Subcomponents --------------------

function CardHeader({ question }: { question: QuestionType }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Asked on {question.askedDate}
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
