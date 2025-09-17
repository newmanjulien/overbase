"use client";

import React from "react";
import { AgentSidebarSkeleton } from "./AgentSidebarSkeleton";

interface Skill {
  key: string;
  name: string;
}

interface AgentSidebarProps {
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
  loading?: boolean;
  skills?: Skill[];
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
  selectedSkill,
  setSelectedSkill,
  loading = false,
  skills = [],
}) => {
  const showSkeleton = loading || skills.length === 0;

  if (showSkeleton) {
    return <AgentSidebarSkeleton />;
  }

  const sortedSkills = [...skills].sort((a, b) =>
    a.key === "installed" ? -1 : b.key === "installed" ? 1 : 0
  );

  return (
    <nav className="space-y-2">
      {sortedSkills.map((skill) => (
        <button
          key={skill.key}
          onClick={() => setSelectedSkill(skill.key)}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
            skill.key === selectedSkill
              ? "bg-white border border-gray-200/60 font-medium text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
          }`}
        >
          <span>{skill.name}</span>
        </button>
      ))}
    </nav>
  );
};
