"use client";

import React from "react";
import { Star } from "lucide-react"; // Replace Star with any Lucide icon you prefer

interface HelperNodeProps {
  onClick?: () => void;
  position?: { bottom?: number; left?: number };
}

const HelperNode: React.FC<HelperNodeProps> = ({
  onClick,
  position = { bottom: 24, left: 24 },
}) => {
  return (
    <div
      className="z-50"
      style={{
        position: "fixed",
        bottom: position.bottom,
        left: position.left,
      }}
    >
      <button
        onClick={onClick}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200/60 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
      >
        {/* Lucide Icon */}
        <Star className="w-4 h-4 text-orange-500" />

        {/* Label */}
        <span className="text-gray-700 text-sm font-regular">Helper</span>
      </button>
    </div>
  );
};

export default HelperNode;
