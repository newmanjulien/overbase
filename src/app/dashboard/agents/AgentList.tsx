"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAgents } from "../../../hooks/useAgents";
import { useSkills } from "../../../hooks/useSkills";
import { AgentCard } from "./AgentCard";

interface AgentListProps {
  selectedSkill: string;
  onLaunchAgent?: (agentId: string) => void;
  setSelectedSkill: (skill: string) => void;
}

interface Agent {
  id: string;
  title: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
  skills?: string[];
  image?: string;
  assignedHandler?: string;
  numericId?: number;
}

type AgentListType = React.FC<AgentListProps> & {
  Sidebar: React.FC<{
    selectedSkill: string;
    setSelectedSkill: (skill: string) => void;
  }>;
};

// Helper: filter and sort agents
const getFilteredAgents = (agents: Agent[], skill: string) =>
  agents
    .filter((a) =>
      skill === "installed"
        ? a.skills?.includes("installed")
        : !a.skills?.includes("installed") && a.skills?.includes(skill)
    )
    .sort((a, b) => (a.numericId ?? 0) - (b.numericId ?? 0));

// Wrapper for installed skill
const SkillWrapper: React.FC<{
  active: boolean;
  children: React.ReactNode;
}> = ({ active, children }) =>
  active ? (
    <div className="rounded-xl p-6 bg-white">{children}</div>
  ) : (
    <>{children}</>
  );

// Hook for updating agent skills
const useUpdateAgentSkills = (agentId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSkills = async (skills: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const agentRef = doc(db, "agents", agentId);
      await updateDoc(agentRef, { skills });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update agent skills";
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { updateSkills, loading, error };
};

// Component to wrap each AgentCard
const AgentCardWrapper: React.FC<{
  agent: Agent;
  setSelectedSkill: (skill: string) => void;
  onLaunchAgent?: (agentId: string) => void;
}> = ({ agent, setSelectedSkill, onLaunchAgent }) => {
  const { updateSkills } = useUpdateAgentSkills(agent.id);

  const handleInstall = async () => {
    const updatedSkills = agent.skills?.includes("installed")
      ? agent.skills.filter((s) => s !== "installed")
      : [...(agent.skills ?? []), "installed"];

    // Optimistic UI update
    agent.skills = updatedSkills;

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
      isInstalled={agent.skills?.includes("installed")}
      image={agent.image}
      onInstall={handleInstall}
      onLaunch={() => onLaunchAgent?.(agent.id)}
      assignedHandler={agent.assignedHandler}
    />
  );
};
AgentCardWrapper.displayName = "AgentCardWrapper";

export const AgentList: AgentListType = ({
  selectedSkill,
  onLaunchAgent,
  setSelectedSkill,
}) => {
  const { agents, loading } = useAgents();

  if (loading) return <p>Loading agents...</p>;
  if (!agents?.length) return <p>No agents found.</p>;

  return (
    <SkillWrapper active={selectedSkill === "installed"}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredAgents(agents, selectedSkill).map((agent) => (
          <AgentCardWrapper
            key={agent.id}
            agent={agent}
            setSelectedSkill={setSelectedSkill}
            onLaunchAgent={onLaunchAgent}
          />
        ))}
      </div>
    </SkillWrapper>
  );
};

// Sidebar component
const AgentListSidebar: React.FC<{
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
}> = ({ selectedSkill, setSelectedSkill }) => {
  const { skills, loading } = useSkills(); // no generic

  if (loading) return <p>Loading skills...</p>;

  const sortedSkills = [...skills].sort((a, b) =>
    a.key === "installed" ? -1 : b.key === "installed" ? 1 : 0
  );

  const buttonClass = (selected: boolean) =>
    `w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
      selected
        ? "bg-white border border-gray-200/60 font-medium text-gray-800"
        : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
    }`;

  return (
    <nav className="space-y-0.5">
      {sortedSkills.map((skill) => (
        <button
          key={skill.key}
          onClick={() => setSelectedSkill(skill.key)}
          className={buttonClass(skill.key === selectedSkill)}
        >
          <span>{skill.name}</span>
        </button>
      ))}
    </nav>
  );
};
AgentListSidebar.displayName = "AgentListSidebar";

AgentList.Sidebar = AgentListSidebar;
