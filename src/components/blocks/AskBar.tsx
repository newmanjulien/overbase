"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AskBar({ onClick }: { onClick: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/user-profile-photo.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div
          onClick={onClick}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full text-sm px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          What do you want to ask or share?
        </div>
      </div>
    </div>
  );
}
