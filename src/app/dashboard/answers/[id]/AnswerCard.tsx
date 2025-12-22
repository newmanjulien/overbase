"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DataTable, { TableRow } from "@/components/blocks/DataTable";
interface AnswerCardProps {
  avatar?: string;
  avatarFallback: string;
  topLabel: string;
  subLabel?: string;
  content?: string;
  tableData?: TableRow[];
}

export default function AnswerCard({
  avatar,
  avatarFallback,
  topLabel,
  subLabel,
  content,
  tableData,
}: AnswerCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      {/* Top Section: matches UserActionCard's header and content style */}
      <div className="p-4">
        {/* Header: avatar + labels + optional icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={avatar || "/placeholder.svg"} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm text-gray-700">{topLabel}</span>
              {subLabel && (
                <span className="text-xs text-gray-400">{subLabel}</span>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        {content && (
          <div className="text-sm text-gray-800 mt-3">
            <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
          </div>
        )}
      </div>

      {/* Table content - used in the same way QuestionCard uses DataTable */}
      {tableData && <DataTable tableData={tableData} />}
    </div>
  );
}
