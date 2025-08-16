"use client";

import { useState } from "react";
import { AgentCard } from "./AgentCard";

const categories = [
  "Installed",
  "Email & Slack",
  "After sales calls",
  "Customer success",
];

interface Agent {
  id: number;
  title: string;
  description: string;
  categories: string[];
  gradientFrom: string;
  gradientTo: string;
}

const initialAgents: Agent[] = [
  {
    id: 1,
    title: "Highlight success",
    description:
      "Find emails and Slacks where you can highlight your team's success",
    categories: ["Email & Slack"],
    gradientFrom: "from-pink-400",
    gradientTo: "to-purple-500",
  },
  {
    id: 2,
    title: "Call to CRM",
    description: "Update your CRM after your call with a prospect",
    categories: ["After sales calls"],
    gradientFrom: "from-green-400",
    gradientTo: "to-teal-500",
  },
  {
    id: 3,
    title: "Action CRM to-dos",
    description: "Take the to-dos assigned to you in your CRM and action them",
    categories: ["Customer success"],
    gradientFrom: "from-yellow-400",
    gradientTo: "to-orange-500",
  },
  {
    id: 4,
    title: "Prep quarterly call",
    description: "Prepare the data for your quarterly calls with customers",
    categories: ["After sales calls"],
    gradientFrom: "from-blue-400",
    gradientTo: "to-indigo-500",
  },
];

export function Agents() {
  const [selectedCategory, setSelectedCategory] = useState("Installed");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);

  const handleInstall = (agentId: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              categories: Array.from(
                new Set([...agent.categories, "Installed"])
              ),
            }
          : agent
      )
    );
    setSelectedCategory("Installed");
  };

  const filteredAgents = agents.filter((agent) =>
    selectedCategory === "Installed"
      ? agent.categories.includes("Installed")
      : !agent.categories.includes("Installed") &&
        agent.categories.includes(selectedCategory)
  );

  return (
    <div>
      {/* Sidebar & Header */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-7xl mx-auto p-6 py-8">
          <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight mb-4">
            Agents
          </h1>
        </div>
      </div>

      <div style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-6 py-16 flex gap-8">
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-0.5">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                    selectedCategory === category
                      ? "bg-white border border-gray-200 font-medium text-gray-800"
                      : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
                  }`}
                >
                  <span>{category}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  title={agent.title}
                  description={agent.description}
                  gradientFrom={agent.gradientFrom}
                  gradientTo={agent.gradientTo}
                  isInstalled={agent.categories.includes("Installed")}
                  onInstall={() => handleInstall(agent.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
