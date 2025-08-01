"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import WorkflowBuilder from "../../../workflow/Workflow";
import { WorkflowType } from "../../../components/WorkflowTypeSelector";

const validWorkflowTypes: WorkflowType[] = [
  "email-slack",
  "updates",
  "research",
];

const getDefaultHandlerForType = (type: WorkflowType): string => {
  switch (type) {
    case "email-slack":
      return "1"; // Email handler
    case "updates":
      return "2"; // Deck creation handler
    case "research":
      return "3"; // Data gathering handler
    default:
      return "1"; // Fallback
  }
};

export default function NewWorkflowPageInner() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section") as WorkflowType | null;

  const initialType: WorkflowType =
    sectionParam && validWorkflowTypes.includes(sectionParam)
      ? sectionParam
      : "email-slack";

  const [workflowType] = useState<WorkflowType>(initialType);

  const assignedHandler = getDefaultHandlerForType(workflowType);

  return (
    <WorkflowBuilder
      initialData={{
        id: undefined,
        name: "",
        description: "",
        type: workflowType,
        assignedHandler,
        steps: [],
      }}
    />
  );
}
