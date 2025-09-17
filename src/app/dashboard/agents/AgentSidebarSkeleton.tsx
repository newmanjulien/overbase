"use client";

import React from "react";

export const AgentSidebarSkeleton: React.FC = () => {
  const skeletonWidths = [73, 86, 62, 73, 79, 74, 61, 67];

  return (
    <nav className="space-y-2 px-1">
      {skeletonWidths.map((w, i) => (
        <div
          key={i}
          className="h-10 rounded-lg skeleton bg-gray-300"
          style={{ width: `${w}%` }}
        />
      ))}
    </nav>
  );
};
