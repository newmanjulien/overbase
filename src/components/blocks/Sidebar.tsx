"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SidebarProps {
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  tagsConfig: {
    key: string;
    name: string;
    header?: string;
    subheader?: string;
  }[];
}

export default function Sidebar({
  selectedTag,
  setSelectedTag,
  tagsConfig,
}: SidebarProps) {
  return (
    <div className="w-56 flex-shrink-0">
      <ToggleGroup
        type="single"
        value={selectedTag}
        onValueChange={(val) => val && setSelectedTag(val)}
        orientation="vertical"
        className="flex-col w-full space-y-0.5"
      >
        {tagsConfig.map((tag) => (
          <ToggleGroupItem
            key={tag.key}
            value={tag.key}
            className={`
              w-full text-left px-3 py-2 text-sm rounded-xl transition-colors flex items-center justify-between
              data-[state=on]:bg-white data-[state=on]:border data-[state=on]:border-gray-200/60
              data-[state=on]:font-medium data-[state=on]:text-gray-800
              data-[state=off]:text-gray-700 data-[state=off]:hover:text-gray-900
              data-[state=off]:hover:bg-white data-[state=off]:border-transparent
            `}
          >
            {tag.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
