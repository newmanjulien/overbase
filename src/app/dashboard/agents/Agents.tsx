"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { AgentCard } from "./AgentCard";

const categories = [
  "Installed",
  "Email & Slack",
  "After sales calls",
  "Customer success",
];

const agentData = [
  {
    id: 1,
    title: "Highlight success",
    description:
      "Find emails and Slacks where you can highlight your team's success",
    category: "Analytics",
    gradientFrom: "from-pink-400",
    gradientTo: "to-purple-500",
  },
  {
    id: 2,
    title: "Call to CRM",
    description: "Update your CRM after your call with a prospect",
    category: "Analytics",
    gradientFrom: "from-green-400",
    gradientTo: "to-teal-500",
  },
  {
    id: 3,
    title: "Action CRM to-dos",
    description: "Take the to-dos assigned to you in your CRM and action them",
    category: "Authentication",
    gradientFrom: "from-yellow-400",
    gradientTo: "to-orange-500",
  },
  {
    id: 4,
    title: "Prep quarterly call",
    description: "Prepare the data for your quarterly calls with customers",
    category: "Productivity",
    gradientFrom: "from-blue-400",
    gradientTo: "to-indigo-500",
  },
];

export function Agents() {
  const [selectedCategory, setSelectedCategory] = useState("Installed");

  // Track selected handler for each agent
  const [handlers, setHandlers] = useState<Record<number, string>>(
    Object.fromEntries(agentData.map((t) => [t.id, "1"]))
  );

  const handleHandlerChange = (agentId: number, handlerId: string) => {
    setHandlers((prev) => ({ ...prev, [agentId]: handlerId }));
  };

  const filteredAgents =
    selectedCategory === "Installed"
      ? agentData
      : agentData.filter(
          (agent) => agent.category === selectedCategory
        );

  return (
    <div>
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-7xl mx-auto p-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
              <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight mb-4">
                Agents
              </h1>
              <div className="flex items-center text-gray-800 text-sm mt-1">
                <span>
                  Install, customize and launch agents built for helping startup
                  CEOs.
                </span>
                <a
                  href="#"
                  className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
                >
                  <span>Learn more</span>
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-6 py-16 flex gap-8">
          {/* Sidebar Categories */}
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
                  {category === "Experimentation" && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 font-medium"
                    >
                      New
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Agent Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  title={agent.title}
                  description={agent.description}
                  gradientFrom={agent.gradientFrom}
                  gradientTo={agent.gradientTo}
                  handlerId={handlers[agent.id]}
                  onHandlerChange={(id) => handleHandlerChange(agent.id, id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
