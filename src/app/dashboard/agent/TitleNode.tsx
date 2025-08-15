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

  const handleSettingsClick = useCallback(() => {
    setShowSettingsMenu(!showSettingsMenu)
  }, [showSettingsMenu])

  const handleSettingsOption = useCallback((option: string) => {
    console.log("Settings option selected:", option)
    setShowSettingsMenu(false)
  }, [])

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-md focus-within:shadow-lg transition-all duration-200 settings-menu-container">
        <Button
          variant="ghost"
          size="sm"
          className="h-14 w-12 p-0 border-0 shadow-none rounded-none hover:bg-gray-50"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </Button>

        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="border-0 shadow-none px-4 py-4 text-lg font-semibold min-w-[200px] focus:ring-0 focus:outline-none bg-transparent"
          placeholder="Agent Title"
        />

        <div className="w-px h-8 bg-gray-200"></div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-14 w-12 p-0 border-0 shadow-none rounded-none hover:bg-gray-50"
            onClick={handleSettingsClick}
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </Button>

          {showSettingsMenu && (
            <div className="absolute top-14 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
      </div>
    </div>
  )
}
