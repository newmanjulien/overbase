"use client";

import { useState } from "react";
import { TemplateCard } from "./TemplateCard";
import { Header } from "@/components/Header";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { tagsConfig, initialTemplates } from "./DummyData";

function Templates() {
  const [selectedTag, setSelectedTag] = useState(tagsConfig[0].key);

  const filteredTemplates = initialTemplates.filter((t) =>
    t.tags.includes(selectedTag)
  );

  const selectedTagData = tagsConfig.find((tag) => tag.key === selectedTag);

  const gridTitle = selectedTagData?.header ?? "Explore Templates";
  const gridSubtitle =
    selectedTagData?.subheader ??
    "Easily apply templates created by your organization and which your colleagues are already using.";

  return (
    <div className="min-h-screen">
      <Header
        title="Templates"
        subtitle="Easily apply templates created by your organization and which your colleagues are already usingy."
        learnMoreLink="#"
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-16">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <ToggleGroup
            type="single"
            value={selectedTag}
            onValueChange={(val) => {
              if (val) setSelectedTag(val);
            }}
            orientation="vertical"
            variant="outline"
            size="sm"
            className="flex-col w-full space-y-0.5"
          >
            {tagsConfig.map((tag) => (
              <ToggleGroupItem
                key={tag.key}
                value={tag.key}
                className="justify-between text-left"
              >
                {tag.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

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
