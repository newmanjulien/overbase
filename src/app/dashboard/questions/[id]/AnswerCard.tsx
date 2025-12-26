"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ASSET_KEYS } from "@/lib/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock, Users } from "lucide-react";
import DataTable, { TableRow } from "@/components/blocks/DataTable";
import type { Id } from "@convex/_generated/dataModel";

interface AnswerCardProps {
  answerId?: Id<"answers">;
  topLabel: string;
  subLabel?: string;
  content?: string;
  tableData?: TableRow[];
  privacy?: "private" | "team";
  onPrivacyChange?: (newPrivacy: "private" | "team") => void;
  onForward?: () => void;
  isQuestion?: boolean; // If true, this is the original question, not an answer
}

export default function AnswerCard({
  topLabel,
  subLabel,
  content,
  tableData,
  privacy,
  onPrivacyChange,
  onForward,
  isQuestion = false,
}: AnswerCardProps) {
  const userAvatarAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.USER_AVATAR,
  });
  const overbaseIconAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.OVERBASE_ICON,
  });
  const userAvatar = userAvatarAsset?.imageUrl ?? null;
  const overbaseIcon = overbaseIconAsset?.imageUrl ?? null;

  const handlePrivacyClick = () => {
    const newPrivacy = privacy === "private" ? "team" : "private";
    onPrivacyChange?.(newPrivacy);
  };

  // Determine avatar based on topLabel
  const isUserCard =
    topLabel === "You asked" || topLabel.includes("You") || isQuestion;

  // Use Convex-stored avatars, fallback gracefully
  const avatar = isUserCard ? userAvatar : overbaseIcon;
  const avatarFallback = isUserCard ? "U" : "AI";

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      {/* Top Section: matches UserActionCard's header and content style */}
      <div className="p-4">
        {/* Header: avatar + labels + optional icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={avatar ?? undefined} />
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
                {privacy && (
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
                )}
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
