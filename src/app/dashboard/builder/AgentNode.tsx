"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import type { NodeData } from "./AgentBuilder";

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

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddBelow(id);
  };

  const handleItemClick =
    (callback?: () => void, disabled?: boolean) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled && callback) callback();
    };

  return (
    <div className="w-80">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <Card
        className="bg-white border border-gray-100 hover:border-gray-200 rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
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
                border: "1.5px solid rgba(255, 110, 100, 0.6)", // <-- selected border color
              }
            : {}
        }
        onClick={handleCardClick}
      >
        <div
          className="p-3 border-b"
          style={{
            borderColor: isEditing ? "rgba(252, 114, 54, 0.1)" : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Step {stepNumber} -{" "}
              <span className="font-normal">{title || "Enter step title"}</span>
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 hover:bg-white`}
                  aria-label="Actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-gray-400 text-lg leading-none">⋯</span>
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
                  onClick={handleItemClick(() => onDelete(id), totalNodes <= 1)}
                  disabled={totalNodes <= 1}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-3 pb-3 pt-0 -mt-1">
          <Button
            onClick={handleAddClick}
            variant="outline"
            size="sm"
            className={`w-full border-0 transition-all duration-200 ${
              isEditing
                ? "bg-white text-gray-800 hover:bg-gray-50"
                : "bg-gray-50 text-gray-800 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            Add Step
          </Button>
        </div>
      </Card>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});

AgentNode.displayName = "AgentNode";
export default AgentNode;
