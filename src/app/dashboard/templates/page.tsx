"use client";

import { useState } from "react";
import { TemplateCard } from "./TemplateCard";
import { Header } from "../../../components/ui/Header";

import { skillsConfig, initialTemplates, Template } from "./DummyData";

function Templates() {
  const [selectedSkill, setSelectedSkill] = useState(skillsConfig[0].key);

  const filteredTemplates = initialTemplates.filter((t) =>
    t.skills.includes(selectedSkill)
  );

  const selectedSkillData = skillsConfig.find(
    (skill) => skill.key === selectedSkill
  );

  const gridTitle = selectedSkillData?.header ?? "Explore Templates";
  const gridSubtitle =
    selectedSkillData?.subheader ??
    "Browse templates by category and launch them directly.";

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Header
        title="Templates"
        subtitle="Browse templates by category and launch them directly."
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

          <div className="rounded-xl">
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
                  onLaunch={() => console.log(`Launching ${template.title}`)}
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
