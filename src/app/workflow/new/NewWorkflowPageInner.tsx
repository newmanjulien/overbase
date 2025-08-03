// "use client";

// import { useSearchParams } from "next/navigation";
// import { useState } from "react";
// import WorkflowBuilder from "../../../workflow/Workflow";
// import { WorkflowType } from "../../../components/WorkflowTypeSelector";

// const validWorkflowTypes: WorkflowType[] = [
//   "email-slack",
//   "updates",
//   "research",
// ];

// const getDefaultHandlerForType = (type: WorkflowType): string => {
//   switch (type) {
//     case "email-slack":
//       return "1"; // Email handler
//     case "updates":
//       return "2"; // Deck creation handler
//     case "research":
//       return "3"; // Data gathering handler
//     default:
//       return "1"; // Fallback
//   }
// };

// export default function NewWorkflowPageInner() {
//   const searchParams = useSearchParams();
//   const sectionParam = searchParams.get("section") as WorkflowType | null;

//   const initialType: WorkflowType =
//     sectionParam && validWorkflowTypes.includes(sectionParam)
//       ? sectionParam
//       : "email-slack";

//   const [workflowType] = useState<WorkflowType>(initialType);

//   const assignedHandler = getDefaultHandlerForType(workflowType);

//   return (
//     <WorkflowBuilder
//       initialData={{
//         id: undefined,
//         name: "",
//         description: "",
//         type: workflowType,
//         assignedHandler,
//         steps: [],
//       }}
//     />
//   );
// }

"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import WorkflowBuilder from "../../../workflow/Workflow";
import { WorkflowType } from "../../../components/WorkflowTypeSelector";

const fromToTypeMap: Record<string, WorkflowType> = {
  email: "email-slack",
  updates: "updates",
  research: "research",
};

const getDefaultHandlerForType = (type: WorkflowType): string => {
  switch (type) {
    case "email-slack":
      return "1";
    case "updates":
      return "2";
    case "research":
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
