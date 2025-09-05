"use client";

import { AgentCard } from "./AgentCard";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export interface Agent {
  id: string;
  numericId?: number;
  title: string;
  description: string;
  skills: string[];
  gradientFrom?: string;
  gradientTo?: string;
  image?: string;
  assignedHandler?: string;
}

interface AgentListProps {
  installedAgents: Agent[];
  otherAgents: Agent[];
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
  onLaunchAgent?: (agentId: string) => void;
  loading?: boolean;
}

const getFilteredAgents = (
  installed: Agent[],
  other: Agent[],
  skill: string
) => {
  if (skill === "installed") {
    return installed.sort((a, b) => (a.numericId ?? 0) - (b.numericId ?? 0));
  } else {
    return other
      .filter((a) => a.skills.includes(skill))
      .sort((a, b) => (a.numericId ?? 0) - (b.numericId ?? 0));
  }
};

const useUpdateAgentSkills = (agentId: string) => {
  const [loading, setLoading] = useState(false);

  const updateSkills = async (skills: string[]) => {
    setLoading(true);
    try {
      const agentRef = doc(db, "agents", agentId);
      await updateDoc(agentRef, { skills });
    } finally {
      setLoading(false);
    }
  };

  return { updateSkills, loading };
};

const AgentCardWrapper: React.FC<{
  agent: Agent;
  setSelectedSkill: (skill: string) => void;
  onLaunchAgent?: (id: string) => void;
}> = ({ agent, setSelectedSkill, onLaunchAgent }) => {
  const { updateSkills } = useUpdateAgentSkills(agent.id);

  const handleInstall = async () => {
    const updatedSkills = agent.skills.includes("installed")
      ? agent.skills.filter((s) => s !== "installed")
      : [...agent.skills, "installed"];

    agent.skills = updatedSkills; // optimistic
    await updateSkills(updatedSkills);
    setSelectedSkill("installed");
  };

  return (
    <AgentCard
      id={agent.id}
      title={agent.title}
      description={agent.description}
      gradientFrom={agent.gradientFrom}
      gradientTo={agent.gradientTo}
      isInstalled={agent.skills.includes("installed")}
      image={agent.image}
      onInstall={handleInstall}
      onLaunch={() => onLaunchAgent?.(agent.id)}
      assignedHandler={agent.assignedHandler}
    />
  );
};

export function AgentList({
  installedAgents,
  otherAgents,
  selectedSkill,
  setSelectedSkill,
  onLaunchAgent,
  loading = false,
}: AgentListProps) {
  const filteredAgents = getFilteredAgents(
    installedAgents,
    otherAgents,
    selectedSkill
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
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
  }

  if (filteredAgents.length === 0) return <p>No agents found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAgents.map((agent) => (
        <AgentCardWrapper
          key={agent.id}
          agent={agent}
          setSelectedSkill={setSelectedSkill}
          onLaunchAgent={onLaunchAgent}
        />
      ))}
    </div>
  );
}

// ---------- Sidebar ----------
AgentList.Sidebar = ({
  selectedSkill,
  setSelectedSkill,
  loading = false,
  skills = [],
}: {
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
  loading?: boolean;
  skills?: { key: string; name: string }[];
}) => {
  // SSR-safe skeleton: show if loading OR skills not yet loaded
  const showSkeleton = loading || skills.length === 0;

  if (showSkeleton) {
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
