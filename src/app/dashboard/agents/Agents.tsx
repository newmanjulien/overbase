"use client";

import { useState } from "react";
import { AgentCard } from "./AgentCard";
import { LaunchModal } from "./LaunchModal";
import { Header } from "../../../components/Header";

// === Category Definitions ===
const categoriesConfig = [
  {
    key: "installed",
    name: "Installed",
    header: "Installed Agents",
    subheader: "These are the agents you've already installed.",
  },
  {
    key: "email",
    name: "Email & Slack",
    header: "Email & Slack Agents",
    subheader: "Automate your email and Slack workflows.",
  },
  {
    key: "sales",
    name: "After Sales Calls",
    header: "After Sales Calls",
    subheader: "Support your post-call workflow and CRM updates.",
  },
  {
    key: "customer",
    name: "Customer Success",
    header: "Customer Success Agents",
    subheader: "Take care of your customers with automated tasks.",
  },
];

// === Agents Data ===
interface Agent {
  id: number;
  title: string;
  description: string;
  categories: string[];
  gradientFrom: string;
  gradientTo: string;
  image?: string;
}

const initialAgents: Agent[] = [
  {
    id: 1,
    title: "Highlight success",
    description:
      "Find emails and Slacks where you can highlight your team's success",
    categories: ["email"],
    gradientFrom: "from-yellow-300",
    gradientTo: "to-yellow-500",
    image: "/images/slack.png",
  },
  {
    id: 2,
    title: "Call to CRM",
    description: "Update your CRM after your call with a prospect",
    categories: ["sales"],
    gradientFrom: "from-purple-700",
    gradientTo: "to-pink-400",
    image: "/images/gong.png",
  },
  {
    id: 3,
    title: "Action CRM to-dos",
    description: "Take the to-dos assigned to you in your CRM and action them",
    categories: ["customer"],
    gradientFrom: "from-green-900",
    gradientTo: "to-green-500",
    image: "/images/pipedrive.png",
  },
  {
    id: 4,
    title: "Prep quarterly call",
    description: "Prepare the data for your quarterly calls with customers",
    categories: ["sales", "installed"],
    gradientFrom: "from-blue-400",
    gradientTo: "to-indigo-500",
    image: "/images/notion.png",
  },
];

export function Agents() {
  const [selectedCategory, setSelectedCategory] = useState("installed");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [launchingAgent, setLaunchingAgent] = useState<Agent | null>(null);

  const handleInstall = (agentId: number) => {
    setAgents((previousAgents) =>
      previousAgents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              categories: Array.from(
                new Set([...agent.categories, "installed"])
              ),
            }
          : agent
      )
    );
    setSelectedCategory("installed");
  };

  // Filter agents by selected category
  const filteredAgents = agents.filter((agent) =>
    selectedCategory === "installed"
      ? agent.categories.includes("installed")
      : !agent.categories.includes("installed") &&
        agent.categories.includes(selectedCategory)
  );

  // Find selected category data
  const selectedCategoryData = categoriesConfig.find(
    (category) => category.key === selectedCategory
  );

  const gridTitle = selectedCategoryData?.header ?? "Explore Agents";
  const gridSubtitle =
    selectedCategoryData?.subheader ??
    "Browse and install agents to help you automate tasks.";

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Main Header */}
      <Header
        title="Agents"
        subtitle="Easily install agents then assign a handler and customize the instructions."
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-18">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-0.5">
            {categoriesConfig.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                  selectedCategory === category.key
                    ? "bg-white border border-gray-200 font-medium text-gray-800"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Agent Grid */}
        <div className="flex-1">
          {/* Title & Subtitle */}
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-800">{gridTitle}</h2>
            <p className="text-gray-500 text-sm mt-1">{gridSubtitle}</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                id={agent.id}
                title={agent.title}
                description={agent.description}
                gradientFrom={agent.gradientFrom}
                gradientTo={agent.gradientTo}
                isInstalled={agent.categories.includes("installed")}
                image={agent.image}
                onInstall={() => handleInstall(agent.id)}
                onLaunch={() => setLaunchingAgent(agent)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Launch Modal */}
      {launchingAgent && (
        <LaunchModal
          isOpen={!!launchingAgent}
          onClose={() => setLaunchingAgent(null)}
        />
      )}
    </div>
  );
}
