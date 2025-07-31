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

export interface Step {
  id: string;
  title: string;
  prompt: string;
  branches: StepBranch[];
  handlerInstructions?: HandlerInstructions;
  userInputInstructions?: UserInputInstructions;
  userApprovalInstructions?: UserApprovalInstructions;
  isOpen: boolean;
}

export const initialSteps: Step[] = [
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
];

export const defaultWorkflowName = "Untitled Workflow";
