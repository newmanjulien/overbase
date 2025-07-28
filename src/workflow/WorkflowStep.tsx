"use client";

import { StepMainUI } from "./StepMainUI";

export interface WorkflowStepProps {
  step: {
    id: string;
    title: string;
    prompt: string;
    branches: any[];
    handlerInstructions?: string;
    userInputInstructions?: any;
    colleagueInstructions?: any;
    isOpen?: boolean;
  };
  onUpdate: (
    id: string,
    updates: {
      title?: string;
      prompt?: string;
      branches?: any[];
      handlerInstructions?: any;
      userInputInstructions?: any;
      colleagueInstructions?: any;
    }
  ) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function WorkflowStep(props: WorkflowStepProps) {
  return (
    <div className="bg-white">
      <StepMainUI {...props} />
    </div>
  );
}
