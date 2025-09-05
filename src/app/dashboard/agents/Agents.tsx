"use client";

import { useState } from "react";
import { Header } from "../../../components/ui/Header";
import { Modal } from "../../../components/ui/Modal";
import { AgentList } from "./AgentList";
import { useInstalledAgents } from "../../../hooks/useInstalledAgents";
import { useOtherAgents } from "../../../hooks/useOtherAgents";
import { useSkills } from "../../../hooks/useSkills";
import { modalData } from "./DummyData";

export function Agents() {
  const [selectedSkill, setSelectedSkill] = useState("installed");
  const [launchingAgent, setLaunchingAgent] = useState<string | null>(null);

  const { agents: installedAgents, loading: agentsLoading } =
    useInstalledAgents();
  const { agents: otherAgents } = useOtherAgents(!agentsLoading);

  const { skills, loading: skillsLoading } = useSkills();

  const handleModalAction = (callback: string) => {
    if (callback === "onAddKey") {
      console.log("Adding API key");
      setLaunchingAgent(null);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Header
        title="Agents"
        subtitle="Easily install agents then assign a handler and customize the instructions."
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-18 relative">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <AgentList.Sidebar
            selectedSkill={selectedSkill}
            setSelectedSkill={setSelectedSkill}
            loading={skillsLoading}
            skills={skills}
          />
        </div>

        {/* Agent grid */}
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-800">
              Explore Agents
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Browse and install agents to help you automate tasks.
            </p>
          </div>

          <AgentList
            installedAgents={installedAgents}
            otherAgents={otherAgents}
            selectedSkill={selectedSkill}
            setSelectedSkill={setSelectedSkill}
            onLaunchAgent={setLaunchingAgent}
            loading={agentsLoading}
          />
        </div>
      </div>

      {launchingAgent && (
        <Modal
          isOpen={!!launchingAgent}
          onClose={() => setLaunchingAgent(null)}
          content={modalData}
          size="md"
          apiKey=""
          onApiKeyChange={() => {}}
          isEnabled={true}
          onEnabledChange={() => {}}
          onAction={handleModalAction}
        />
      )}
    </div>
  );
}
