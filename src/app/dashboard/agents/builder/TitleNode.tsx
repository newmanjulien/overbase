"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Settings, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface TitleNodeProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onBack?: () => void;
}

export default function TitleNode({
  title,
  onTitleChange,
  onBack,
}: TitleNodeProps) {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };
    if (showSettingsMenu)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettingsMenu]);

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="flex items-center bg-white border border-gray-200/60 hover:border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-[320px]">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              router.push("/dashboard/agents");
            }
          }}
          className="h-13 w-12 p-0 border-0 shadow-none rounded-l-md rounded-r-none hover:bg-gray-50 flex-shrink-0 flex items-center justify-center"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Button>

        {/* Editable Title */}
        <div className="flex-1 px-2 py-2">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            className="border-0 shadow-none w-full text-lg font-medium focus:ring-0 focus:outline-none bg-transparent"
            placeholder="Enter agent Title"
          />
        </div>

        {/* Divider & Settings */}
        {!isEditing && (
          <>
            <div className="w-px h-13 bg-gray-100" />
            <div className="relative" ref={settingsRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsMenu((prev) => !prev)} // moved inline
                className="h-13 w-12 p-0 border-0 shadow-none rounded-r-md rounded-l-none hover:bg-gray-50 flex-shrink-0 flex items-center justify-center"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </Button>

              {showSettingsMenu && (
                <div className="absolute top-14 left-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        router.push("/dashboard/agents/builder/success");
                        setShowSettingsMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Define Success
                    </button>
                    <button
                      onClick={() => {
                        router.push("/dashboard/agents/builder/context");
                        setShowSettingsMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Context
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
