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
import type { NodeData } from "./Agent"; // <- only import

interface AgentNodeProps extends NodeProps {
  data: NodeData;
}

const AgentNode = memo(({ data, id }: AgentNodeProps) => {
  const { stepNumber, title, prompt, onEdit, onDelete, onAddBelow } = data;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger edit if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]')) {
      return;
    }
    onEdit(id);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddBelow(id);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="w-80">
      {/* Input handle */}
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <Card 
        className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="pt-0 p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                {stepNumber}
              </div>
              <h3 className="font-medium text-gray-900">
                {title}
              </h3>
            </div>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  aria-label="Actions"
                  onClick={handleDropdownClick}
                >
                  <span className="text-gray-400 text-lg leading-none">⋯</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={() => onDelete(id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Add Button */}
        <div className="px-4">
          <Button
            onClick={handleButtonClick}
            variant="outline"
            size="sm"
            className="w-full border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50"
          >
            + Add Step
          </Button>
        </div>
      </Card>

      {/* Output handle */}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});

AgentNode.displayName = "AgentNode";

export default AgentNode;
