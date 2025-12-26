"use client";

import { Lock, Users, MoreHorizontal } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface QuestionCardShellProps {
  questionId: Id<"questions">;
  displayPrivacy: "private" | "team";
  onPrivacyChange?: (
    questionId: Id<"questions">,
    newPrivacy: "private" | "team"
  ) => void;
  headerRight?: React.ReactNode; // Optional pill slot
  dateLabel: string; // "Asked on {date}" or "Scheduled for {date}"
  children: React.ReactNode; // Question content
  showMenu?: boolean; // Whether to show the menu icon (for recurring/in-progress)
}

export function QuestionCardShell({
  questionId,
  displayPrivacy,
  onPrivacyChange,
  headerRight,
  dateLabel,
  children,
  showMenu = false,
}: QuestionCardShellProps) {
  const cancelQuestion = useMutation(
    api.features.questions.mutations.cancelQuestion
  );

  const handleCardClick = () => {
    window.open(`/dashboard/questions/${questionId}`, "_blank");
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPrivacy = displayPrivacy === "private" ? "team" : "private";
    onPrivacyChange?.(questionId, newPrivacy);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCancelQuestion = () => {
    cancelQuestion({ id: questionId });
  };

  return (
    <div
      onClick={handleCardClick}
      className="block bg-white rounded-2xl border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        {/* Header row: date + privacy | pill | menu */}
        <div className="flex items-center justify-between mb-2 min-h-[22px]">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            {dateLabel}
            <span className="text-gray-400">·</span>
            <button
              type="button"
              onClick={handlePrivacyClick}
              className="text-gray-400 capitalize hover:underline cursor-pointer flex items-center gap-1"
            >
              {displayPrivacy === "private" ? (
                <Lock size={12} className="shrink-0" />
              ) : (
                <Users size={12} className="shrink-0" />
              )}
              {displayPrivacy}
            </button>
          </span>
          <div className="flex items-center gap-2">
            {headerRight}
            {showMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md"
                    onClick={handleMenuClick}
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleCancelQuestion}
                    className="text-red-600 focus:text-red-600 focus:bg-red-100"
                  >
                    Cancel question
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Content area (question text, table, etc.) */}
        {children}
      </div>
    </div>
  );
}
