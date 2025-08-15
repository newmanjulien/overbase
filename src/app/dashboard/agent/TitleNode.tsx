"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import { type NodeProps } from "@xyflow/react"

interface TitleNodeData {
  title: string
  onTitleChange: (title: string) => void
  onBack: () => void
  onSettings: () => void
}

export default function TitleNode({ data }: NodeProps<TitleNodeData>) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState(data.title)

  const handleSave = () => {
    data.onTitleChange(tempTitle)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setTempTitle(data.title)
      setIsEditing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm min-w-[300px]">
      <div className="flex items-center justify-between gap-2">
        {/* Back button */}
        <Button variant="ghost" size="icon" onClick={data.onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Title */}
        <div className="flex-1 text-center">
          {isEditing ? (
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-lg font-semibold border-none p-0 focus:ring-0 focus:border-none text-center"
              placeholder="Enter agent title"
              autoFocus
            />
          ) : (
            <h2
              className="text-lg font-semibold cursor-pointer hover:text-gray-600 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {data.title || "Untitled Agent"}
            </h2>
          )}
        </div>

        {/* Settings button */}
        <Button variant="ghost" size="icon" onClick={data.onSettings}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
