"use client";

import { useState } from "react";
import { TemplateCard } from "./TemplateCard";
import { Header } from "@/components/blocks/Header";
import Sidebar from "@/components/blocks/Sidebar";
import { tagsConfig, initialTemplates } from "./DummyData";

function Templates() {
  const categories = [
    { key: "all", name: "All Templates" },
    { key: "marketing", name: "Marketing" },
    { key: "sales", name: "Sales" },
    { key: "hr", name: "HR" },
  ];

  const [selectedTag, setSelectedTag] = useState(tagsConfig[0].key);

  const filteredTemplates = initialTemplates.filter((t) =>
    t.tags.includes(selectedTag)
  );

  const selectedTagData = tagsConfig.find((tag) => tag.key === selectedTag);

  const gridTitle = selectedTagData?.header ?? "Explore Templates";
  const gridSubtitle =
    selectedTagData?.subheader ??
    "Use templates your colleagues are already using.";

  return (
    <div className="h-full w-full">
      <Header
        title="Templates"
        subtitle="Use templates your colleagues are already using."
        learnMoreLink="#"
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-16">
        {/* Sidebar */}
        <Sidebar
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          tagsConfig={tagsConfig}
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
                  key={template.id}
                  id={template.id}
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
