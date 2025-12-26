"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ASSET_KEYS } from "@/lib/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic } from "lucide-react";

type ModalOptions = {
  tab?: "one" | "recurring";
  showTabs?: boolean;
  placeholder?: string;
};

export default function FollowupBar({
  onClick,
}: {
  onClick: (options: ModalOptions) => void;
}) {
  const userAvatarAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.USER_AVATAR,
  });
  const userAvatar = userAvatarAsset?.imageUrl ?? null;

  const handleClick = () => {
    onClick({
      showTabs: false,
      placeholder: "Ask a follow up question...",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar ?? undefined} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div
          onClick={handleClick}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full text-sm px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          Do you have follow up questions?
        </div>

        <button
          disabled
          className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-300 cursor-not-allowed"
          title="Dictate"
        >
          <Mic className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
