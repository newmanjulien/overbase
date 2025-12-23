"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock, Users } from "lucide-react";
import DataTable, { TableRow } from "@/components/blocks/DataTable";
interface AnswerCardProps {
  avatar?: string;
  avatarFallback: string;
  topLabel: string;
  subLabel?: string;
  content?: string;
  tableData?: TableRow[];
  privacy: "private" | "team";
  onPrivacyChange?: (newPrivacy: "private" | "team") => void;
  onForward?: () => void;
}

export default function AnswerCard({
  avatar,
  avatarFallback,
  topLabel,
  subLabel,
  content,
  tableData,
  privacy,
  onPrivacyChange,
  onForward,
}: AnswerCardProps) {
  const handlePrivacyClick = () => {
    const newPrivacy = privacy === "private" ? "team" : "private";
    onPrivacyChange?.(newPrivacy);
  };

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
              <div className="flex items-center gap-1.5">
                {subLabel && (
                  <span className="text-xs text-gray-400">{subLabel}</span>
                )}
                {subLabel && (
                  <span className="text-gray-300 text-[10px]">·</span>
                )}
                <button
                  type="button"
                  onClick={handlePrivacyClick}
                  className="text-gray-400 text-xs capitalize hover:underline cursor-pointer flex items-center gap-1"
                >
                  {privacy === "private" ? (
                    <Lock size={11} className="shrink-0" />
                  ) : (
                    <Users size={11} className="shrink-0" />
                  )}
                  {privacy}
                </button>
              </div>
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
      {tableData && <DataTable tableData={tableData} onForward={onForward} />}
    </div>
  );
}
