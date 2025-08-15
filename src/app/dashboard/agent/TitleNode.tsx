"use client"

import { useState, useCallback } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Settings, ArrowLeft } from "lucide-react"

interface TitleNodeProps {
  title: string
  onTitleChange: (newTitle: string) => void
  onBack?: () => void
}

export default function TitleNode({ title, onTitleChange, onBack }: TitleNodeProps) {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleSettingsClick = useCallback(() => {
    setShowSettingsMenu(!showSettingsMenu)
  }, [showSettingsMenu])

  const handleSettingsOption = useCallback((option: string) => {
    console.log("Settings option selected:", option)
    setShowSettingsMenu(false)
  }, [])

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="flex items-center bg-white border border-gray-100 hover:border-gray-200 rounded-md hover:shadow-md transition-all duration-200 w-[300px]">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-14 w-12 p-0 border-0 shadow-none rounded-none hover:bg-gray-50 flex-shrink-0 flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </Button>

        {/* Editable Title wrapped in padding div */}
        <div
          className={`flex-1 transition-all duration-200 ${
            isEditing ? "px-2 py-2" : "px-2 py-2"
          }`}
        >
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            className="border-0 shadow-none w-full text-lg font-semibold focus:ring-0 focus:outline-none bg-transparent"
            placeholder="Agent Title"
          />
        </div>

        {/* Divider & Settings */}
        {!isEditing && (
          <>
            <div className="w-px h-14 bg-gray-100" />
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSettingsClick}
                className="h-14 w-12 p-0 border-0 shadow-none rounded-none hover:bg-gray-50 flex-shrink-0 flex items-center justify-center"
              >
                <Settings className="h-4 w-4 text-gray-600" />
              </Button>

              {showSettingsMenu && (
                <div className="absolute top-14 left-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleSettingsOption("define-success")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Define Success
                    </button>
                    <button
                      onClick={() => handleSettingsOption("context")}
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
  )
}
