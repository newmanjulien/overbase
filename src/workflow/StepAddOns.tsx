"use client";

import { useState } from "react";
import { Plus, X, Split, UserCheck, Share2, FileEdit } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

interface StepBranch {
  id: string;
  condition: string;
  prompt: string;
}
interface HandlerInstructions {
  whenToCall: string;
  qaInstructions: string;
}
interface UserInputInstructions {
  whenToAsk: string;
  inputDescription: string;
  approvalConditions: string;
}
interface ColleagueInstructions {
  whenToLoop: string;
  selectedColleague: string;
  whatToRequest: string;
}
interface Colleague {
  id: string;
  name: string;
}

interface StepAddOnsProps {
  step: {
    id: string;
    branches: StepBranch[];
    handlerInstructions?: HandlerInstructions;
    userInputInstructions?: UserInputInstructions;
    colleagueInstructions?: ColleagueInstructions;
  };
  onUpdate: (
    id: string,
    updates: {
      branches?: StepBranch[];
      handlerInstructions?: HandlerInstructions | undefined;
      userInputInstructions?: UserInputInstructions | undefined;
      colleagueInstructions?: ColleagueInstructions | undefined;
    }
  ) => void;
}

export function StepAddOns({ step, onUpdate }: StepAddOnsProps) {
  /* ---------- Local state for branches ---------- */
  const [localBranches, setLocalBranches] = useState<StepBranch[]>(
    step.branches || []
  );
  const handleBranchUpdate = (
    branchId: string,
    field: "condition" | "prompt",
    value: string
  ) => {
    const updated = localBranches.map((b) =>
      b.id === branchId ? { ...b, [field]: value } : b
    );
    setLocalBranches(updated);
    onUpdate(step.id, { branches: updated });
  };
  const addBranch = () => {
    const newBranch: StepBranch = {
      id: Date.now().toString(),
      condition: "",
      prompt: "",
    };
    const updated = [...localBranches, newBranch];
    setLocalBranches(updated);
    onUpdate(step.id, { branches: updated });
  };
  const removeBranch = (branchId: string) => {
    const updated = localBranches.filter((b) => b.id !== branchId);
    setLocalBranches(updated);
    onUpdate(step.id, { branches: updated });
  };

  /* ---------- Handler Instructions ---------- */
  const [localHandlerInstructions, setLocalHandlerInstructions] =
    useState<HandlerInstructions>(
      step.handlerInstructions || { whenToCall: "", qaInstructions: "" }
    );
  const handleHandlerUpdate = (
    field: "whenToCall" | "qaInstructions",
    value: string
  ) => {
    const updated = { ...localHandlerInstructions, [field]: value };
    setLocalHandlerInstructions(updated);
    onUpdate(step.id, { handlerInstructions: updated });
  };
  const addHandlerInstructions = () =>
    onUpdate(step.id, {
      handlerInstructions: { whenToCall: "", qaInstructions: "" },
    });
  const removeHandlerInstructions = () =>
    onUpdate(step.id, { handlerInstructions: undefined });

  /* ---------- User Input Instructions ---------- */
  const [localUserInputInstructions, setLocalUserInputInstructions] =
    useState<UserInputInstructions>(
      step.userInputInstructions || {
        whenToAsk: "",
        inputDescription: "",
        approvalConditions: "",
      }
    );
  const handleUserInputUpdate = (
    field: "whenToAsk" | "inputDescription" | "approvalConditions",
    value: string
  ) => {
    const updated = { ...localUserInputInstructions, [field]: value };
    setLocalUserInputInstructions(updated);
    onUpdate(step.id, { userInputInstructions: updated });
  };
  const addUserInputInstructions = () =>
    onUpdate(step.id, {
      userInputInstructions: {
        whenToAsk: "",
        inputDescription: "",
        approvalConditions: "",
      },
    });
  const removeUserInputInstructions = () =>
    onUpdate(step.id, { userInputInstructions: undefined });

  /* ---------- Colleague Instructions ---------- */
  const [localColleagueInstructions, setLocalColleagueInstructions] =
    useState<ColleagueInstructions>(
      step.colleagueInstructions || {
        whenToLoop: "",
        selectedColleague: "",
        whatToRequest: "",
      }
    );
  const handleColleagueUpdate = (
    field: "whenToLoop" | "selectedColleague" | "whatToRequest",
    value: string
  ) => {
    const updated = { ...localColleagueInstructions, [field]: value };
    setLocalColleagueInstructions(updated);
    onUpdate(step.id, { colleagueInstructions: updated });
  };
  const addColleagueInstructions = () =>
    onUpdate(step.id, {
      colleagueInstructions: {
        whenToLoop: "",
        selectedColleague: "",
        whatToRequest: "",
      },
    });
  const removeColleagueInstructions = () =>
    onUpdate(step.id, { colleagueInstructions: undefined });

  /* Mock colleagues */
  const [colleagues] = useState<Colleague[]>([
    {
      id: "1",
      name: "Sarah Chen",
    },
    {
      id: "2",
      name: "Mike Johnson",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
    },
    {
      id: "4",
      name: "David Kim",
    },
    {
      id: "5",
      name: "Lisa Wang",
    },
  ]);

  const hasBranches = step.branches.length > 0;
  const hasHandlerInstructions = step.handlerInstructions !== undefined;
  const hasUserInputInstructions = step.userInputInstructions !== undefined;
  const hasColleagueInstructions = step.colleagueInstructions !== undefined;

  return (
    <div className="py-3 space-y-6">
      {/* Branches Section */}
      {hasBranches && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Step Options
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={addBranch}
              className="text-xs bg-transparent"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Option
            </Button>
          </div>
          <div className="space-y-4">
            {localBranches.map((branch, idx) => (
              <div
                key={branch.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Option {idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBranch(branch.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      When to use this option
                    </label>
                    <Input
                      value={branch.condition}
                      onChange={(e) =>
                        handleBranchUpdate(
                          branch.id,
                          "condition",
                          e.target.value
                        )
                      }
                      placeholder="e.g., When email is urgent..."
                      className="text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      AI Prompt for this option
                    </label>
                    <Textarea
                      value={branch.prompt}
                      onChange={(e) =>
                        handleBranchUpdate(branch.id, "prompt", e.target.value)
                      }
                      placeholder="Describe what the AI should do..."
                      className="min-h-[80px] resize-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Handler Instructions */}
      {hasHandlerInstructions && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Handler Instructions
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeHandlerInstructions}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                When should the AI call on the handler for help?
              </label>
              <Textarea
                value={localHandlerInstructions.whenToCall}
                onChange={(e) =>
                  handleHandlerUpdate("whenToCall", e.target.value)
                }
                placeholder="e.g., When email requires complex decision..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                How should the AI quality check the handler&apos;s work?
              </label>
              <Textarea
                value={localHandlerInstructions.qaInstructions}
                onChange={(e) =>
                  handleHandlerUpdate("qaInstructions", e.target.value)
                }
                placeholder="e.g., Check response addresses all customer concerns..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* User Input Instructions */}
      {hasUserInputInstructions && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Input or Approval Instructions
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeUserInputInstructions}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                When should the AI ask for your input?
              </label>
              <Textarea
                value={localUserInputInstructions.whenToAsk}
                onChange={(e) =>
                  handleUserInputUpdate("whenToAsk", e.target.value)
                }
                placeholder="e.g., When customer asks for specific product details..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                What should the AI request?
              </label>
              <Textarea
                value={localUserInputInstructions.inputDescription}
                onChange={(e) =>
                  handleUserInputUpdate("inputDescription", e.target.value)
                }
                placeholder="e.g., Ask for latest pricing sheet..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                When should the AI ask for your approval before proceeding?
              </label>
              <Textarea
                value={localUserInputInstructions.approvalConditions}
                onChange={(e) =>
                  handleUserInputUpdate("approvalConditions", e.target.value)
                }
                placeholder="e.g., Before sending responses to VIP customers..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Colleague Instructions */}
      {hasColleagueInstructions && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Colleague Loop-in Instructions
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeColleagueInstructions}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                When should the AI loop in a colleague?
              </label>
              <Textarea
                value={localColleagueInstructions.whenToLoop}
                onChange={(e) =>
                  handleColleagueUpdate("whenToLoop", e.target.value)
                }
                placeholder="e.g., When technical expertise is needed..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Select colleague to loop in
              </label>
              <Select
                value={localColleagueInstructions.selectedColleague}
                onValueChange={(v) =>
                  handleColleagueUpdate("selectedColleague", v)
                }
              >
                <SelectTrigger className="flex-1 text-sm">
                  <SelectValue placeholder="Choose a colleague..." />
                </SelectTrigger>
                <SelectContent>
                  {colleagues.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-medium">{c.name}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                What should the AI request from the colleague?
              </label>
              <Textarea
                value={localColleagueInstructions.whatToRequest}
                onChange={(e) =>
                  handleColleagueUpdate("whatToRequest", e.target.value)
                }
                placeholder="e.g., Technical guidance on the issue..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="py-3">
        <div className="grid grid-cols-2 gap-2">
          {!hasBranches && (
            <Button
              variant="outline"
              size="sm"
              onClick={addBranch}
              className="text-xs bg-transparent text-gray-800 border-gray-200 hover:bg-gray-50"
            >
              <Split className="mr-1 h-3 w-3" /> Split into options
            </Button>
          )}
          {!hasHandlerInstructions && (
            <Button
              variant="outline"
              size="sm"
              onClick={addHandlerInstructions}
              className="text-xs bg-transparent text-gray-800 border-gray-200 hover:bg-gray-50"
            >
              <FileEdit className="mr-1 h-3 w-3" /> Add handler instructions
            </Button>
          )}
          {!hasUserInputInstructions && (
            <Button
              variant="outline"
              size="sm"
              onClick={addUserInputInstructions}
              className="text-xs bg-transparent text-gray-800 border-gray-200 hover:bg-gray-50"
            >
              <UserCheck className="mr-1 h-3 w-3" /> Ask for input or approval
            </Button>
          )}
          {!hasColleagueInstructions && (
            <Button
              variant="outline"
              size="sm"
              onClick={addColleagueInstructions}
              className="text-xs bg-transparent text-gray-800 border-gray-200 hover:bg-gray-50"
            >
              <Share2 className="mr-1 h-3 w-3" /> Loop in a colleague
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
