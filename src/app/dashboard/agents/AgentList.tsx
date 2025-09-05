"use client";

import { AgentCard } from "./AgentCard";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useSkills } from "../../../hooks/useSkills";

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
}: AgentListProps) {
  const { skills, loading: skillsLoading } = useSkills();
  if (skillsLoading) return <p>Loading skills...</p>;

  const filteredAgents = getFilteredAgents(
    installedAgents,
    otherAgents,
    selectedSkill
  );

  if (!filteredAgents.length) return <p>No agents found.</p>;

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

AgentList.Sidebar = ({
  selectedSkill,
  setSelectedSkill,
}: {
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
}) => {
  const { skills, loading } = useSkills();
  if (loading) return <p>Loading skills...</p>;

  const sortedSkills = [...skills].sort((a, b) =>
    a.key === "installed" ? -1 : b.key === "installed" ? 1 : 0
  );

  return (
    <nav className="space-y-0.5">
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
