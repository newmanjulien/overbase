"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DataTable, { TableRow } from "@/components/blocks/DataTable";
import { LucideIcon } from "lucide-react";

interface AnswerCardProps {
  avatar?: string;
  avatarFallback: string;
  topLabel: string;
  subLabel?: string;
  content?: string;
  tableData?: TableRow[];
  rightIcon?: LucideIcon;
  onIconClick?: () => void;
}

export default function AnswerCard({
  avatar,
  avatarFallback,
  topLabel,
  subLabel,
  content,
  tableData,
  rightIcon: RightIcon,
  onIconClick,
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
              {subLabel && <span className="text-xs text-gray-400">{subLabel}</span>}
            </div>
          </div>
          {RightIcon && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onIconClick?.();
              }}
              className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors group"
              aria-label="Action"
            >
              <RightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Main content */}
        {content && (
          <div className="text-sm text-gray-800 mt-3">
            <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
          </div>
        )}
      </div>

      {/* Table content - used in the same way RequestCard uses DataTable */}
      {tableData && <DataTable tableData={tableData} />}
    </div>
  );
}
