// "use client";

// import { useState } from "react";
// import { Plus, ArrowLeft, Save } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";
// import { WorkflowStep } from "./WorkflowStep";
// import Link from "next/link";
// import { Step, defaultWorkflowName } from "./DummyData";
// import { InfoCard } from "../components/InfoCard";
// import {
//   WorkflowTypeSelector,
//   WorkflowType,
// } from "../components/WorkflowTypeSelector";

// import {
//   collection,
//   addDoc,
//   updateDoc,
//   doc,
//   Timestamp,
// } from "firebase/firestore";
// import { db } from "../lib/firebase";

// interface StepBranch {
//   id: string;
//   condition: string;
//   prompt: string;
// }

// interface UserInputInstructions {
//   whenToAsk: string;
//   inputDescription: string;
// }

// interface UserApprovalInstructions {
//   whenToAsk: string;
//   approvalConditions: string;
// }

// interface ColleagueInstructions {
//   whenToLoop: string;
//   selectedColleague: string;
//   whatToRequest: string;
// }

// interface WorkflowBuilderProps {
//   initialData?: {
//     id?: string;
//     name?: string;
//     description?: string;
//     type?: WorkflowType;
//     steps?: any[];
//   };
// }

// export default function WorkflowBuilder({ initialData }: WorkflowBuilderProps) {
//   const [workflowName, setWorkflowName] = useState(
//     initialData?.name || defaultWorkflowName
//   );
//   const [workflowDescription, setWorkflowDescription] = useState(
//     initialData?.description ||
//       "Create a step-by-step workflow by adding prompts that describe what you want the AI to do at each stage."
//   );
//   const [workflowType, setWorkflowType] = useState<WorkflowType>(
//     initialData?.type || "triage-emails"
//   );
//   const [steps, setSteps] = useState<Step[]>(
//     (initialData?.steps || []).map((s) => ({ ...s, isOpen: false })) || []
//   );
//   const [workflowId, setWorkflowId] = useState(initialData?.id || null);

//   const addStep = () => {
//     const newStep: Step = {
//       id: Date.now().toString(),
//       title: "",
//       prompt: "",
//       branches: [],
//       isOpen: true,
//     };
//     // Close all existing steps and add the new one
//     setSteps([...steps.map((step) => ({ ...step, isOpen: false })), newStep]);
//   };

//   const updateStep = (
//     id: string,
//     updates: {
//       title?: string;
//       prompt?: string;
//       branches?: StepBranch[];
//       userInputInstructions?: UserInputInstructions | undefined;
//       userApprovalInstructions?: UserApprovalInstructions | undefined;
//       colleagueInstructions?: ColleagueInstructions | undefined;
//     }
//   ) => {
//     setSteps(
//       steps.map((step) => (step.id === id ? { ...step, ...updates } : step))
//     );
//   };

//   const deleteStep = (id: string) => {
//     setSteps(steps.filter((step) => step.id !== id));
//   };

//   const toggleStep = (id: string) => {
//     setSteps(
//       steps.map((step) =>
//         step.id === id
//           ? { ...step, isOpen: !step.isOpen }
//           : { ...step, isOpen: false }
//       )
//     );
//   };

//   const moveStepUp = (id: string) => {
//     const currentIndex = steps.findIndex((step) => step.id === id);
//     if (currentIndex > 0) {
//       const newSteps = [...steps];
//       const temp = newSteps[currentIndex];
//       newSteps[currentIndex] = newSteps[currentIndex - 1];
//       newSteps[currentIndex - 1] = temp;
//       setSteps(newSteps);
//     }
//   };

//   const moveStepDown = (id: string) => {
//     const currentIndex = steps.findIndex((step) => step.id === id);
//     if (currentIndex < steps.length - 1) {
//       const newSteps = [...steps];
//       const temp = newSteps[currentIndex];
//       newSteps[currentIndex] = newSteps[currentIndex + 1];
//       newSteps[currentIndex + 1] = temp;
//       setSteps(newSteps);
//     }
//   };

//   const [isSaving, setIsSaving] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);

//   const handleSave = async () => {
//     if (!steps.length || !steps[0].title.trim()) {
//       alert("Please complete at least one step before saving.");
//       return;
//     }

//     setIsSaving(true);
//     setSaveSuccess(false);

//     try {
//       const workflowData = {
//         name: workflowName,
//         description: workflowDescription,
//         type: workflowType,
//         steps,
//         updatedAt: Timestamp.now(),
//       };

//       if (workflowId) {
//         // Update existing workflow
//         await updateDoc(doc(db, "workflows", workflowId), workflowData);
//       } else {
//         // Create new workflow
//         const docRef = await addDoc(collection(db, "workflows"), {
//           ...workflowData,
//           createdAt: Timestamp.now(),
//         });
//         setWorkflowId(docRef.id);
//       }

//       setSaveSuccess(true);
//       setTimeout(() => setSaveSuccess(false), 3000);
//     } catch (error) {
//       console.error("Error saving workflow:", error);
//       alert("An error occurred while saving your workflow.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-6 py-8">
//         {/* Back Button and Title Section */}
//         <div className="mb-8">
//           <Link href="/">
//             <Button
//               variant="ghost"
//               className="mb-4 text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
//             >
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back to dashboard
//             </Button>
//           </Link>

//           {/* Editable title and subtitle */}
//           <div className="space-y-4">
//             <div>
//               <Input
//                 data-title
//                 value={workflowName}
//                 onChange={(e) => setWorkflowName(e.target.value)}
//                 className="font-medium border-none shadow-none p-1 h-auto bg-transparent focus-visible:ring-0 hover:bg-gray-100 cursor-text"
//               />
//             </div>

//             <div className="flex items-center space-x-2">
//               <Input
//                 value={workflowDescription}
//                 onChange={(e) => setWorkflowDescription(e.target.value)}
//                 className="text-gray-600 text-sm border-none shadow-none p-1 h-auto bg-transparent focus-visible:ring-0 hover:bg-gray-100 cursor-text"
//               />
//             </div>
//           </div>

//           {/* Type Selector: */}
//           <WorkflowTypeSelector
//             selectedType={workflowType}
//             onTypeChange={setWorkflowType}
//           />
//         </div>

//         {/* Steps Section */}
//         <div className="space-y-4 mb-8">
//           <h2 className="text-lg font-medium text-gray-800">Workflow Steps</h2>

//           <div className="space-y-3">
//             {steps.map((step, index) => (
//               <div key={step.id} className="relative">
//                 <div className="absolute -left-8 top-4 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
//                   {index + 1}
//                 </div>
//                 <WorkflowStep
//                   step={step}
//                   onUpdate={updateStep}
//                   onDelete={deleteStep}
//                   onToggle={toggleStep}
//                   onMoveUp={moveStepUp}
//                   onMoveDown={moveStepDown}
//                   canMoveUp={index > 0}
//                   canMoveDown={index < steps.length - 1}
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Add Step Button */}
//           <Button
//             onClick={addStep}
//             variant="outline"
//             className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 py-8 bg-transparent"
//           >
//             <Plus className="mr-2 h-4 w-4" />
//             Add Step
//           </Button>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center justify-between pt-6 border-t border-gray-200">
//           <Link href="/">
//             <Button
//               variant="outline"
//               className="text-gray-600 border-gray-200 hover:bg-gray-100"
//             >
//               Cancel
//             </Button>
//           </Link>
//           <Button
//             onClick={handleSave}
//             disabled={isSaving || !steps.length}
//             className="font-normal bg-white border border-gray-200 relative"
//           >
//             {isSaving ? (
//               <span className="flex items-center">
//                 <svg
//                   className="animate-spin mr-2 h-4 w-4 text-gray-500"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8H4z"
//                   ></path>
//                 </svg>
//                 Saving...
//               </span>
//             ) : saveSuccess ? (
//               <span className="flex items-center text-gray-700">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="mr-2 h-4 w-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//                 Saved
//               </span>
//             ) : (
//               <span className="flex items-center">
//                 <Save className="mr-2 h-4 w-4" />
//                 {workflowId ? "Update Workflow" : "Save Workflow"}
//               </span>
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Plus, ArrowLeft, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { WorkflowStep } from "./WorkflowStep";
import Link from "next/link";
import { Step, defaultWorkflowName } from "./DummyData";
import { InfoCard } from "../components/InfoCard";
import {
  WorkflowTypeSelector,
  WorkflowType,
} from "../components/WorkflowTypeSelector";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

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

interface WorkflowBuilderProps {
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    type?: WorkflowType;
    assignedHandler?: string;
    steps?: any[];
  };
}

const getDefaultHandlerForType = (type: WorkflowType): string => {
  switch (type) {
    case "triage-emails":
      return "1"; // Email handler
    case "create-decks":
      return "2"; // Deck creation handler
    case "gather-data":
      return "3"; // Data gathering handler
    default:
      return "1"; // Fallback
  }
};

export default function WorkflowBuilder({ initialData }: WorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState(
    initialData?.name || defaultWorkflowName
  );
  const [workflowDescription, setWorkflowDescription] = useState(
    initialData?.description ||
      "Create a step-by-step workflow by adding prompts that describe what you want the AI to do at each stage."
  );
  const [workflowType, setWorkflowType] = useState<WorkflowType>(
    initialData?.type || "triage-emails"
  );
  const [assignedHandler, setAssignedHandler] = useState<string>(
    initialData?.assignedHandler ||
      getDefaultHandlerForType(initialData?.type || "triage-emails")
  );
  const [steps, setSteps] = useState<Step[]>(
    (initialData?.steps || []).map((s) => ({ ...s, isOpen: false })) || []
  );
  const [workflowId, setWorkflowId] = useState(initialData?.id || null);

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
      userInputInstructions?: UserInputInstructions | undefined;
      userApprovalInstructions?: UserApprovalInstructions | undefined;
      colleagueInstructions?: ColleagueInstructions | undefined;
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

  const handleTypeChange = (newType: WorkflowType) => {
    setWorkflowType(newType);
    // Automatically update the assigned handler based on the new type
    const newHandler = getDefaultHandlerForType(newType);
    setAssignedHandler(newHandler);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!steps.length || !steps[0].title.trim()) {
      alert("Please complete at least one step before saving.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        type: workflowType,
        assignedHandler: assignedHandler,
        steps,
        updatedAt: Timestamp.now(),
      };

      if (workflowId) {
        // Update existing workflow
        await updateDoc(doc(db, "workflows", workflowId), workflowData);
      } else {
        // Create new workflow
        const docRef = await addDoc(collection(db, "workflows"), {
          ...workflowData,
          createdAt: Timestamp.now(),
        });
        setWorkflowId(docRef.id);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("An error occurred while saving your workflow.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button and Title Section */}
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4 text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>

          {/* Editable title and subtitle */}
          <div className="space-y-4">
            <div>
              <Input
                data-title
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="font-medium border-none shadow-none p-1 h-auto bg-transparent focus-visible:ring-0 hover:bg-gray-100 cursor-text"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Input
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="text-gray-600 text-sm border-none shadow-none p-1 h-auto bg-transparent focus-visible:ring-0 hover:bg-gray-100 cursor-text"
              />
            </div>
          </div>

          {/* Type Selector: */}
          <WorkflowTypeSelector
            selectedType={workflowType}
            onTypeChange={handleTypeChange}
          />
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
          <Link href="/">
            <Button
              variant="outline"
              className="text-gray-600 border-gray-200 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving || !steps.length}
            className="font-normal bg-white border border-gray-200 relative"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin mr-2 h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                {workflowId ? "Update Workflow" : "Save Workflow"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
