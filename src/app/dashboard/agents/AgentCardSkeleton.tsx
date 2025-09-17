"use client";

import React from "react";

export const AgentCardSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200/60 overflow-hidden"
        >
          <div className="relative h-56 flex items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 skeleton" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full skeleton" />
          <div className="bg-white p-4 pt-8 space-y-2">
            <div className="h-4 w-3/4 skeleton-text rounded" />
            <div className="h-3 w-5/6 skeleton-text rounded" />
          </div>
          <div className="p-3 pt-0">
            <div className="h-8 w-full skeleton rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
