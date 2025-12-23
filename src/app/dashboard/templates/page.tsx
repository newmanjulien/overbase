"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TemplateCard } from "./TemplateCard";
import { Header } from "@/components/blocks/Header";
import Sidebar from "@/components/blocks/Sidebar";

// Fallback data in case Convex hasn't loaded yet
const fallbackTags = [
  {
    key: "onboarding",
    name: "Onboarding",
    header: "Onboarding Tasks",
    subheader:
      "Guide new clients to adopt and start using the platform effectively",
  },
];

function Templates() {
  const templates = useQuery(api.features.templates.getAllTemplates);
  const tagsConfig = useQuery(api.features.templates.getAllTags);

  // Use fallback while loading
  const tags = tagsConfig ?? fallbackTags;
  const [selectedTag, setSelectedTag] = useState(tags[0]?.key ?? "onboarding");

  // Filter templates by selected tag
  const filteredTemplates =
    templates?.filter((t) => t.tags.includes(selectedTag)) ?? [];

  const selectedTagData = tags.find((tag) => tag.key === selectedTag);

  const gridTitle = selectedTagData?.header ?? "Explore Templates";
  const gridSubtitle =
    selectedTagData?.subheader ??
    "Use templates your people are already using.";

  // Loading state
  if (templates === undefined || tagsConfig === undefined) {
    return (
      <div className="h-full w-full">
        <Header
          title="Templates"
          subtitle="Use templates your people are already using."
          learnMoreLink="#"
        />

        <div className="max-w-7xl mx-auto px-2 py-10 flex gap-16">
          {/* Sidebar skeleton */}
          <div className="w-48 space-y-3">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="flex-1">
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse mt-2" />
            </div>

            <div className="rounded-3xl p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Header
        title="Templates"
        subtitle="Use templates your people are already using."
        learnMoreLink="#"
      />

      <div className="max-w-7xl mx-auto px-2 py-10 flex gap-16">
        {/* Sidebar */}
        <Sidebar
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          tagsConfig={tags}
        />

        {/* Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-800">{gridTitle}</h2>
            <p className="text-gray-500 text-sm mt-1">{gridSubtitle}</p>
          </div>

          <div className="rounded-3xl p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template._id}
                  id={template._id}
                  title={template.title}
                  description={template.description}
                  gradientFrom={template.gradientFrom}
                  gradientTo={template.gradientTo}
                  image={template.image}
                  onUse={() => console.log(`Using ${template.title}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return <Templates />;
}
