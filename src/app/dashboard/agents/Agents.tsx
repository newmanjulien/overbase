"use client";

import { useState } from "react";
import { AgentCard } from "./AgentCard";
import { Modal } from "../../../components/Modal";
import { Header } from "../../../components/Header";

// Import data from DummyData.ts
import { skillsConfig, initialAgents, Agent, modalData } from "./DummyData";

export function Agents() {
  const [selectedSkill, setSelectedSkill] = useState("installed");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [launchingAgent, setLaunchingAgent] = useState<Agent | null>(null);

  // Modal state
  const [apiKey, setApiKey] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const handleInstall = (agentId: number) => {
    setAgents((previousAgents) =>
      previousAgents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              skills: Array.from(new Set([...agent.skills, "installed"])),
            }
          : agent
      )
    );
    setSelectedSkill("installed");
  };

  const handleModalAction = (callback: string) => {
    if (callback === "onAddKey") {
      console.log("Adding API key:", apiKey);
      setLaunchingAgent(null);
    }
  };

  const filteredAgents = agents
    .filter((agent) =>
      selectedSkill === "installed"
        ? agent.skills.includes("installed")
        : !agent.skills.includes("installed") &&
          agent.skills.includes(selectedSkill)
    )
    .sort((a, b) => a.id - b.id);

  const selectedSkillData = skillsConfig.find(
    (skill) => skill.key === selectedSkill
  );

  const gridTitle = selectedSkillData?.header ?? "Explore Agents";
  const gridSubtitle =
    selectedSkillData?.subheader ??
    "Browse and install agents to help you automate tasks.";

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Header
        title="Agents"
        subtitle="Easily install agents then assign a handler and customize the instructions."
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-18">
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-0.5">
            {skillsConfig.map((skill) => (
              <button
                key={skill.key}
                onClick={() => setSelectedSkill(skill.key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                  selectedSkill === skill.key
                    ? "bg-white border border-gray-200/60 font-medium text-gray-800"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
                }`}
              >
                <span>{skill.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-800">{gridTitle}</h2>
            <p className="text-gray-500 text-sm mt-1">{gridSubtitle}</p>
          </div>

          <div
            className={`rounded-xl ${
              selectedSkill === "installed" ? "p-6 bg-white" : ""
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  id={agent.id}
                  title={agent.title}
                  description={agent.description}
                  gradientFrom={agent.gradientFrom}
                  gradientTo={agent.gradientTo}
                  isInstalled={agent.skills.includes("installed")}
                  image={agent.image}
                  onInstall={() => handleInstall(agent.id)}
                  onLaunch={() => setLaunchingAgent(agent)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {launchingAgent && (
        <Modal
          isOpen={!!launchingAgent}
          onClose={() => setLaunchingAgent(null)}
          content={modalData}
          size="md"
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          isEnabled={isEnabled}
          onEnabledChange={setIsEnabled}
          onAction={handleModalAction}
        />
      )}
    </div>
  );
}
