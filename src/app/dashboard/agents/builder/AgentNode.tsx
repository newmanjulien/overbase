"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { MoreVertical, Plus } from "lucide-react";
import type { NodeData } from "./Builder";
import Image from "next/image";

interface AgentNodeProps extends NodeProps {
  data: NodeData & {
    nodeIndex: number;
    totalNodes: number;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    editingNodeId?: string;
  };
}

const AgentNode = memo(({ data, id }: AgentNodeProps) => {
  const {
    stepNumber,
    title,
    prompt,
    onEdit,
    onDelete,
    onAddBelow,
    nodeIndex,
    totalNodes,
    onMoveUp,
    onMoveDown,
    editingNodeId,
  } = data;

  const isEditing = editingNodeId === id;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="menuitem"]')) return;
    onEdit(id);
  };

  const handleItemClick =
    (callback?: () => void, disabled?: boolean) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled && callback) callback();
    };

  // Split prompt into words and highlight @mentions
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
    <div className="w-88">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <Card
        className="bg-white border border-gray-100 hover:border-gray-200 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow p-0"
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
        <div className="p-3 pb-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {stepNumber}.{" "}
              <span className="font-normal">{title || "New step"}</span>
            </h3>
            <div className="flex items-center space-x-1">
              {data.integration && (
                <Image
                  src={data.integration}
                  alt={title || "Agent"}
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
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
                      () => onMoveUp(id),
                      totalNodes <= 1 || nodeIndex === 0
                    )}
                    disabled={totalNodes <= 1 || nodeIndex === 0}
                    className="hover:bg-gray-100 disabled:text-gray-400"
                  >
                    Move Up
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleItemClick(
                      () => onMoveDown(id),
                      totalNodes <= 1 || nodeIndex === totalNodes - 1
                    )}
                    disabled={totalNodes <= 1 || nodeIndex === totalNodes - 1}
                    className="hover:bg-gray-100 disabled:text-gray-400"
                  >
                    Move Down
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleItemClick(
                      () => onDelete(id),
                      totalNodes <= 1
                    )}
                    disabled={totalNodes <= 1}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
      <div
        className="nodrag nopan"
        style={{ position: "relative", height: 60 }}
      >
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="calc(50% + 18px)"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "all",
          }}
        >
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-8 w-8 flex items-center justify-center bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-gray-600 hover:text-gray-800 font-normal text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddBelow(id);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});

AgentNode.displayName = "AgentNode";
export default AgentNode;
