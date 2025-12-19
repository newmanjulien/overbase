"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Repeat, Zap } from "lucide-react";

export default function AskBar({ onClick }: { onClick: () => void }) {
  const footerButtons = [
    { icon: Clock, label: "One time" },
    { icon: Repeat, label: "Recurring" },
    { icon: Zap, label: "Quick" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-1 pt-4 mb-4">
      <div className="flex items-center gap-2">
        <Avatar className="h-9 w-9 ml-3">
          <AvatarImage src="/images/alex.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div
          onClick={onClick}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full text-sm px-4 py-2 mr-3 text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          What question do you want to ask?
        </div>
      </div>
      <div className="flex gap-2 mt-1 items-center">
        {footerButtons.map((btn, index) => (
          <React.Fragment key={btn.label}>
            <button
              onClick={onClick}
              className="flex-1 flex items-center justify-center rounded-full gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <btn.icon className="h-4 w-4" />
              {btn.label}
            </button>
            {index < footerButtons.length - 1 && (
              <div className="w-px h-6 bg-gray-200"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
