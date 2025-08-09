"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import WorkflowBuilder from "../../../workflow/Workflow";
import { WorkflowType } from "../../../components/WorkflowTypeSelector";

const fromToTypeMap: Record<string, WorkflowType> = {
  email: "email-slack",
  sales: "sales",
  customer: "customer",
};

const getDefaultHandlerForType = (type: WorkflowType): string => {
  switch (type) {
    case "email-slack":
      return "1";
    case "sales":
      return "2";
    case "customer":
      return "3";
    default:
      return "1";
  }
};

export default function NewWorkflowPageInner() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  const [initialData, setInitialData] = useState<{
    id?: string;
    name: string;
    description: string;
    type: WorkflowType;
    assignedHandler: string;
    steps: any[];
  } | null>(null);

  useEffect(() => {
    const workflowType =
      fromParam && fromToTypeMap[fromParam]
        ? fromToTypeMap[fromParam]
        : "email-slack";

    setInitialData({
      id: undefined,
      name: "",
      description: "",
      type: workflowType,
      assignedHandler: getDefaultHandlerForType(workflowType),
      steps: [],
    });
  }, [fromParam]);

  if (!initialData) {
    return <div className="p-4 text-gray-500">Loading workflow...</div>;
  }

  return <WorkflowBuilder initialData={initialData} />;
}
