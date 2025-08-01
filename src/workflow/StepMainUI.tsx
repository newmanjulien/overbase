"use client";

import { useState } from "react";
import {
  ChevronRight,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../components/ui/collapsible";
import { Badge } from "../components/ui/badge";
import dynamic from "next/dynamic";

const StepAddOns = dynamic(
  () => import("./addons").then((mod) => mod.StepAddOns),
  {
    loading: () => (
      <div className="text-sm text-gray-400 mt-4">Loading options...</div>
    ),
    ssr: false,
  }
);

interface StepBranch {
  id: string;
  condition: string;
  prompt: string;
}

interface UserApprovalInstructions {
  whenToAsk: string;
  approvalConditions: string;
}

interface UserInputInstructions {
  whenToAsk: string;
  inputDescription: string;
}

interface ColleagueInstructions {
  whenToLoop: string;
  selectedColleague: string;
  whatToRequest: string;
}

export interface StepMainUIProps {
  step: {
    id: string;
    title: string;
    prompt: string;
    branches: StepBranch[];
    userApprovalInstructions?: UserApprovalInstructions;
    userInputInstructions?: UserInputInstructions;
    colleagueInstructions?: ColleagueInstructions;
    isOpen?: boolean;
  };
  onUpdate: (
    id: string,
    updates: {
      title?: string;
      prompt?: string;
      branches?: StepBranch[];
      userApprovalInstructions?: UserApprovalInstructions;
      userInputInstructions?: UserInputInstructions;
      colleagueInstructions?: ColleagueInstructions;
    }
  ) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function StepMainUI({
  step,
  onUpdate,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: StepMainUIProps) {
  const [localTitle, setLocalTitle] = useState(step.title);
  const [localPrompt, setLocalPrompt] = useState(step.prompt);

  const handleTitleBlur = () => {
    if (localTitle !== step.title) onUpdate(step.id, { title: localTitle });
  };

  const handlePromptBlur = () => {
    if (localPrompt !== step.prompt) onUpdate(step.id, { prompt: localPrompt });
  };

  const hasBranches = step.branches.length > 0;

  return (
    <Collapsible open={step.isOpen} onOpenChange={() => onToggle(step.id)}>
      <div className="bg-white border border-gray-200/60 rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <ChevronRight
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  step.isOpen ? "rotate-90" : ""
                }`}
              />
              <GripVertical className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700 text-sm">
                  {step.title || "Untitled Step"}
                </span>
                {hasBranches && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-700"
                  >
                    {step.branches.length}{" "}
                    {step.branches.length === 1 ? "option" : "options"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-50 rounded-md border border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(step.id);
                  }}
                  disabled={!canMoveUp}
                  className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-none border-r border-gray-200"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(step.id);
                  }}
                  disabled={!canMoveDown}
                  className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-none"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(step.id);
                }}
                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Main step body and StepAddOns (only visible when open) */}
        <CollapsibleContent>
          <hr className="border-t border-gray-100" />
          <div className="px-3">
            <div className="pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Name
                </label>
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  placeholder="Enter step name..."
                  className="w-full border"
                />
              </div>

              {!hasBranches && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Prompt
                  </label>
                  <Textarea
                    value={localPrompt}
                    onChange={(e) => setLocalPrompt(e.target.value)}
                    onBlur={handlePromptBlur}
                    placeholder="Describe what you want the AI to do in this step..."
                    className="w-full min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Be specific about what you want the AI to accomplish in this
                    step.
                  </p>
                </div>
              )}
            </div>

            {/* Use the new modular StepAddOns */}
            <StepAddOns step={step} onUpdate={onUpdate} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
