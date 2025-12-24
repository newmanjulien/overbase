import { TemplateCard } from "./TemplateCard";
import { Header } from "@/components/blocks/Header";
import Sidebar from "@/components/blocks/Sidebar";
import type { Template } from "./types";

interface TemplatesProps {
  templates: Template[];
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  tagsForSidebar: { key: string; name: string }[];
  isLoading: boolean;
}

function LoadingSkeleton() {
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
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-lg animate-pulse" />
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

export function Templates({
  templates,
  selectedTag,
  setSelectedTag,
  tagsForSidebar,
  isLoading,
}: TemplatesProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
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
          tagsConfig={tagsForSidebar}
        />

        {/* Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-800">
              {selectedTag || "All Templates"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Browse templates in this category
            </p>
          </div>

          <div className="rounded-3xl p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template._id}
                  id={template._id}
                  title={template.title}
                  description={template.description}
                  gradient={template.gradient}
                  imageUrl={template.imageUrl}
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
