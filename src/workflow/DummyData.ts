interface StepBranch {
  id: string;
  condition: string;
  prompt: string;
}

interface UserInputInstructions {
  whenToAsk: string;
  inputDescription: string;
}

interface UserApprovalInstructions {
  whenToAsk: string;
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

export interface Step {
  id: string;
  title: string;
  prompt: string;
  branches: StepBranch[];
  userInputInstructions?: UserInputInstructions;
  userApprovalInstructions?: UserApprovalInstructions;
  colleagueInstructions?: ColleagueInstructions;
  isOpen: boolean;
}

export const colleagues: Colleague[] = [
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
];

export const defaultWorkflowName = "Untitled Workflow";
