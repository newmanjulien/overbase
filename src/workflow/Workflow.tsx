"use client";

import { useState } from "react";
import { Plus, ArrowLeft, Save, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { WorkflowStep } from "./WorkflowStep";

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

interface UserApprovalInstructions {
  whenToAsk: string;
  approvalDescription: string;
}

interface Step {
  id: string;
  title: string;
  prompt: string;
  branches: StepBranch[];
  handlerInstructions?: HandlerInstructions;
  userInputInstructions?: UserInputInstructions;
  userApprovalInstructions?: UserApprovalInstructions;
  isOpen: boolean;
}

export default function WorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "1",
      title: "Analyze Email Content",
      prompt:
        "Read the email and identify the main topic, sender information, and urgency level.",
      branches: [],
      isOpen: false,
    },
    {
      id: "2",
      title: "Categorize Email",
      prompt:
        "Based on the content analysis, categorize this email as: customer inquiry, internal communication, or requires routing.",
      branches: [],
      isOpen: false,
    },
  ]);

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: "",
      prompt: "",
      branches: [],
      isOpen: true,
    };
    // Close all existing steps and add the new one
    setSteps([...steps.map((step) => ({ ...step, isOpen: false })), newStep]);
  };

  const updateStep = (
    id: string,
    updates: {
      title?: string;
      prompt?: string;
      branches?: StepBranch[];
      handlerInstructions?: HandlerInstructions;
      userInputInstructions?: UserInputInstructions;
      userApprovalInstructions?: UserApprovalInstructions;
    }
  ) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, ...updates } : step))
    );
  };

  const deleteStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const toggleStep = (id: string) => {
    setSteps(
      steps.map((step) =>
        step.id === id
          ? { ...step, isOpen: !step.isOpen }
          : { ...step, isOpen: false }
      )
    );
  };

  const moveStepUp = (id: string) => {
    const currentIndex = steps.findIndex((step) => step.id === id);
    if (currentIndex > 0) {
      const newSteps = [...steps];
      const temp = newSteps[currentIndex];
      newSteps[currentIndex] = newSteps[currentIndex - 1];
      newSteps[currentIndex - 1] = temp;
      setSteps(newSteps);
    }
  };

  const moveStepDown = (id: string) => {
    const currentIndex = steps.findIndex((step) => step.id === id);
    if (currentIndex < steps.length - 1) {
      const newSteps = [...steps];
      const temp = newSteps[currentIndex];
      newSteps[currentIndex] = newSteps[currentIndex + 1];
      newSteps[currentIndex + 1] = temp;
      setSteps(newSteps);
    }
  };

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving workflow:", {
      name: workflowName,
      steps,
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button and Title Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="space-y-4">
            <div>
              <Input
                data-title
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="font-medium border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <p className="text-gray-600 text-sm">
                Create a step-by-step workflow by adding prompts that describe
                what you want the AI to do at each stage.
              </p>
              <a
                href="#"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm transition-colors"
              >
                Learn more
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-medium text-gray-800">Workflow Steps</h2>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="absolute -left-8 top-4 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                  {index + 1}
                </div>
                <WorkflowStep
                  step={step}
                  onUpdate={updateStep}
                  onDelete={deleteStep}
                  onToggle={toggleStep}
                  onMoveUp={moveStepUp}
                  onMoveDown={moveStepDown}
                  canMoveUp={index > 0}
                  canMoveDown={index < steps.length - 1}
                />
              </div>
            ))}
          </div>

          {/* Add Step Button */}
          <Button
            onClick={addStep}
            variant="outline"
            className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 py-8 bg-transparent"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            className="text-gray-600 border-gray-200 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            className="bg-white border-gray-200"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}
