// "use client";

// import { ArrowLeft } from "lucide-react";
// import Link from "next/link";
// import { Input } from "../components/ui/input";
// import { Button } from "../components/ui/button";
// import {
//   WorkflowTypeSelector,
//   WorkflowType,
// } from "../components/WorkflowTypeSelector";

// interface WorkflowHeaderProps {
//   from: string | null;
//   workflowName: string;
//   setWorkflowName: (value: string) => void;
//   workflowDescription: string;
//   setWorkflowDescription: (value: string) => void;
//   workflowType: WorkflowType;
//   handleTypeChange: (type: WorkflowType) => void;
// }

// export function WorkflowHeader({
//   from,
//   workflowName,
//   setWorkflowName,
//   workflowDescription,
//   setWorkflowDescription,
//   workflowType,
//   handleTypeChange,
// }: WorkflowHeaderProps) {
//   const workflowTypes: { id: WorkflowType; label: string }[] = [
//     { id: "email-slack", label: "Email & Slack" },
//     { id: "updates", label: "Investor updates" },
//     { id: "research", label: "Internal research" },
//   ];

//   return (
//     <div className="mb-8">
//       <Link href={`/?section=${from || ""}`}>
//         <Button
//           variant="ghost"
//           className="mb-4 text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back to dashboard
//         </Button>
//       </Link>

//       <div className="space-y-4">
//         <div>
//           <Input
//             data-title
//             value={workflowName}
//             onChange={(e) => setWorkflowName(e.target.value)}
//             placeholder="Enter workflow title..."
//             className="placeholder-gray-800 font-medium border-none shadow-none p-1 h-auto bg-transparent focus-visible:ring-0 hover:bg-gray-100 cursor-text"
//           />
//         </div>

//         <div className="flex items-center space-x-2">
//           <Input
//             value={workflowDescription}
//             onChange={(e) => setWorkflowDescription(e.target.value)}
//             placeholder="Enter workflow description..."
//             className="placeholder-gray-500 text-gray-600 text-sm border-none shadow-none p-1 h-auto bg-transparent focus-visible:ring-0 hover:bg-gray-100 cursor-text"
//           />
//         </div>
//       </div>

//       <WorkflowTypeSelector
//         selectedType={workflowType}
//         onTypeChange={handleTypeChange}
//         types={workflowTypes}
//       />
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  WorkflowTypeSelector,
  WorkflowType,
} from "../components/WorkflowTypeSelector";
import { LoadingOverlay } from "../components/LoadingOverlay";

interface WorkflowHeaderProps {
  from: string | null;
  workflowName: string;
  setWorkflowName: (value: string) => void;
  workflowDescription: string;
  setWorkflowDescription: (value: string) => void;
  workflowType: WorkflowType;
  handleTypeChange: (type: WorkflowType) => void;
}

export function WorkflowHeader({
  from,
  workflowName,
  setWorkflowName,
  workflowDescription,
  setWorkflowDescription,
  workflowType,
  handleTypeChange,
}: WorkflowHeaderProps) {
  const [loading, setLoading] = useState(false);

  const handleBackClick = () => {
    setLoading(true);
  };

  const workflowTypes: { id: WorkflowType; label: string }[] = [
    { id: "email-slack", label: "Email & Slack" },
    { id: "updates", label: "Investor updates" },
    { id: "research", label: "Internal research" },
  ];

  return (
    <div className="mb-8 relative">
      {loading && <LoadingOverlay />}

      <Link href={`/?section=${from || ""}`} onClick={handleBackClick}>
        <Button
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Button>
      </Link>

      <div className="space-y-4">
        <div>
          <Input
            data-title
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Enter workflow title..."
            className="placeholder-gray-800 font-medium border-none shadow-none p-1 h-auto bg-transparent focus-visible:ring-0 hover:bg-gray-100 cursor-text"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Input
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            placeholder="Enter workflow description..."
            className="placeholder-gray-500 text-gray-600 text-sm border-none shadow-none p-1 h-auto bg-transparent focus-visible:ring-0 hover:bg-gray-100 cursor-text"
          />
        </div>
      </div>

      <WorkflowTypeSelector
        selectedType={workflowType}
        onTypeChange={handleTypeChange}
        types={workflowTypes}
      />
    </div>
  );
}
