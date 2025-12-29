"use client";

import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ReactNode } from "react";

export interface SearchableChecklistItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface SearchableChecklistProps {
  items: SearchableChecklistItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  maxHeight?: string;
  renderItem?: (item: SearchableChecklistItem) => ReactNode;
  header?: ReactNode;
}

export function SearchableChecklist({
  items,
  selectedIds,
  onToggle,
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  emptyMessage = "No results found",
  maxHeight = "max-h-[160px]",
  renderItem,
  header,
}: SearchableChecklistProps) {
  return (
    <div className="space-y-3">
      {header && header}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
        />
      </div>

      <div className={`${maxHeight} overflow-y-auto pr-2 space-y-1`}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <Checkbox
              checked={selectedIds.includes(item.id)}
              onCheckedChange={() => onToggle(item.id)}
              className="rounded border-gray-300"
            />
            {item.icon && <div className="text-gray-500">{item.icon}</div>}
            <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate flex-1">
              {item.label}
            </span>
            {renderItem && renderItem(item)}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
