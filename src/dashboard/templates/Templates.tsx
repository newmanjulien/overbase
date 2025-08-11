"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { TemplateCard } from "./TemplateCard";

const categories = [
  "Browse All",
  "AI",
  "Analytics",
  "Authentication",
  "CMS",
  "Commerce",
  "DevTools",
  "Experimentation",
  "Flags",
  "Logging",
  "Messaging",
  "Monitoring",
  "Observability",
  "Productivity",
];

const templateData = [
  {
    id: 1,
    title: "Neon",
    description: "Ship faster with Serverless Postgres",
    category: "Analytics",
    createdBy: "Sarah Chen",
    creatorPhoto: "/images/sarah-chen.png",
    gradientFrom: "from-pink-400",
    gradientTo: "to-purple-500",
  },
  {
    id: 2,
    title: "Upstash",
    description: "Serverless DB (Redis, Vector, Queue)",
    category: "Analytics",
    createdBy: "Marcus Johnson",
    creatorPhoto: "/images/marcus-johnson.png",
    gradientFrom: "from-green-400",
    gradientTo: "to-teal-500",
  },
  {
    id: 3,
    title: "Supabase",
    description: "Open source Firebase alternative",
    category: "Authentication",
    createdBy: "Elena Rodriguez",
    creatorPhoto: "/images/elena-rodriguez.png",
    gradientFrom: "from-yellow-400",
    gradientTo: "to-orange-500",
  },
  {
    id: 4,
    title: "Notion",
    description: "All-in-one workspace for notes",
    category: "Productivity",
    createdBy: "Amanda Foster",
    creatorPhoto: "/images/amanda-foster.png",
    gradientFrom: "from-blue-400",
    gradientTo: "to-indigo-500",
  },
];

export function Templates() {
  const [selectedCategory, setSelectedCategory] = useState("Browse All");

  const filteredTemplates =
    selectedCategory === "Browse All"
      ? templateData
      : templateData.filter(
          (template) => template.category === selectedCategory
        );

  return (
    <div>
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
              <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight mb-4">
                Templates
              </h1>
              <div className="flex items-center text-gray-800 text-sm mt-1">
                <span>
                  Copy templates other startup CEOs created then easily edit and
                  customize them.
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

            <Button
              onClick={() => {
                /* does nothing */
              }}
              className="font-normal bg-white text-black border border-gray-200 hover:bg-gray-100"
            >
              Publish a template
            </Button>
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

          {/* Template Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  title={template.title}
                  description={template.description}
                  createdBy={template.createdBy}
                  creatorPhoto={template.creatorPhoto}
                  gradientFrom={template.gradientFrom}
                  gradientTo={template.gradientTo}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
