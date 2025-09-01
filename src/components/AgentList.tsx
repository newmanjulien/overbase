"use client";

import { useAgents } from "../hooks/useAgents";
import { useSkills } from "../hooks/useSkills";
import { Button } from "../components/ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AgentListProps {}

export const AgentList: React.FC<AgentListProps> = () => {
  const { agents, loading } = useAgents();
  const { skills } = useSkills();

  if (loading) return <p>Loading agents...</p>;
  if (!agents.length) return <p>No agents found.</p>;

  const toggleInstalled = async (agentId: number) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const updatedSkills = agent.skills.includes("installed")
      ? agent.skills.filter((s) => s !== "installed")
      : [...agent.skills, "installed"];

    // Optimistic UI update
    agent.skills = updatedSkills;

    // Firestore update
    try {
      const agentRef = doc(db, "agents", agentId.toString());
      await updateDoc(agentRef, { skills: updatedSkills });
    } catch (err) {
      console.error("Failed to update agent skills:", err);
    }
  };

  return (
    <div className="space-y-4">
      {skills.map((skill) => (
        <div key={skill.key}>
          <h3 className="text-lg font-semibold">{skill.header}</h3>
          <p className="text-sm text-gray-500">{skill.subheader}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {agents
              .filter((a) => a.skills.includes(skill.key))
              .map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 border rounded shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-semibold">{agent.title}</h4>
                    <p className="text-sm">{agent.description}</p>
                  </div>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => toggleInstalled(agent.id)}
                  >
                    {agent.skills.includes("installed")
                      ? "Uninstall"
                      : "Install"}
                  </Button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
