"use client";

import { memo } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { AddStepButton } from "./AddStepButton";
import type { NodeData } from "./Builder";
import { useEditingNodeContext } from "./Builder";

interface AgentNodeProps {
  data: NodeData;
  id: string;
}

const AgentNode = memo(({ data, id }: AgentNodeProps) => {
  const {
    stepNumber,
    title,
    prompt,
    onEdit,
    onDelete,
    onAddBelow,
    nodeIndex = 0,
    totalNodes = 1,
    onMoveUp,
    onMoveDown,
    integration,
  } = data;

  const { editingNodeId } = useEditingNodeContext();
  const isEditing = editingNodeId === id;

  // ---------------- Card Click ----------------
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="menuitem"]')) return;
    onEdit?.();
  };

  // ---------------- Dropdown Menu Handler ----------------
  const handleItemClick =
    (callback?: (id: string) => void, disabled?: boolean) =>
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled && callback) callback(id);
    };

  // ---------------- Prompt Rendering ----------------
  const renderPrompt = () => {
    if (!prompt) return "Click to tell the AI what you want it to do";
    return prompt.split(/(\s+)/).map((word, i) =>
      word.startsWith("@") ? (
        <span key={i} className="text-blue-500">
          {word}
        </span>
      ) : (
        word
      )
    );
  };

  return (
    <div className="w-88 mx-auto">
      <Card
        className="bg-white border border-gray-100 hover:border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow transition-all duration-200 p-0"
        style={
          isEditing
            ? {
                background: `
                  linear-gradient(135deg,
                    rgba(252, 114, 54, 0.08) 30%,
                    rgba(252, 73, 54, 0.06) 55%,
                    rgba(252, 54, 54, 0.04) 70%,
                    rgba(252, 73, 54, 0.06) 85%,
                    rgba(252, 114, 54, 0.08) 100%
                  ),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))
                `,
                border: "1.5px solid rgba(255, 110, 100, 0.6)",
              }
            : {}
        }
        onClick={handleCardClick}
      >
        <div className="p-3 pb-0 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex-1 min-w-0 truncate">
            {stepNumber}.{" "}
            <span className="font-normal truncate">{title || "New step"}</span>
          </h3>

          <div className="flex items-center space-x-1">
            {integration && (
              <Image
                src={integration}
                alt={title || "Agent"}
                width={20}
                height={20}
                className="rounded-full object-cover ml-2"
              />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${
                    isEditing ? "hover:bg-white" : "hover:bg-gray-100"
                  }`}
                  aria-label="Actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-32"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={handleItemClick(
                    onMoveUp,
                    totalNodes <= 1 || nodeIndex === 0
                  )}
                  disabled={totalNodes <= 1 || nodeIndex === 0}
                  className="hover:bg-gray-100 disabled:text-gray-400"
                >
                  Move Up
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleItemClick(
                    onMoveDown,
                    totalNodes <= 1 || nodeIndex === totalNodes - 1
                  )}
                  disabled={totalNodes <= 1 || nodeIndex === totalNodes - 1}
                  className="hover:bg-gray-100 disabled:text-gray-400"
                >
                  Move Down
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleItemClick(onDelete, totalNodes <= 1)}
                  disabled={totalNodes <= 1}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Prompt preview */}
        <div className="px-3 pb-3 pt-0 -mt-3">
          <div
            className={`rounded-md px-3 py-2 border ${
              isEditing
                ? "bg-white border-gray-100"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <p
              className={`text-sm font-regular leading-relaxed ${
                prompt ? "text-gray-900" : "text-gray-400"
              } truncate overflow-hidden whitespace-nowrap`}
            >
              {renderPrompt()}
            </p>
          </div>
        </div>
      </Card>

      {/* Add-step button */}
      <AddStepButton onAddBelow={onAddBelow} />
    </div>
  );
});

AgentNode.displayName = "AgentNode";
export default AgentNode;
