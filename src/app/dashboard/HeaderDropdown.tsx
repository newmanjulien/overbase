"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface HeaderDropdownProps<T extends string> {
  sections: readonly T[]; // <-- readonly here
  labelMap: Record<T, string>;
  activeSection: T;
  setActiveSection: (section: T) => void;
  buttonLabel?: string;
}

export function HeaderDropdown<T extends string>({
  sections,
  labelMap,
  activeSection,
  setActiveSection,
  buttonLabel = "Workflows",
}: HeaderDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (section: T) => {
    setActiveSection(section);
    setOpen(false);
  };

  const isActive = sections.includes(activeSection);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`px-2.5 py-1.5 text-sm font-normal rounded-md transition-colors flex items-center gap-1 ${
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        {buttonLabel}
        <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => handleSelect(section)}
                className={`w-full px-3 py-2 text-left text-sm ${
                  activeSection === section
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {labelMap[section]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
