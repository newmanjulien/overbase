// "use client";

// import { useState } from "react";
// import { Plus } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { WorkflowStep } from "./WorkflowStep";
// import { Step, defaultWorkflowName } from "./DummyData";
// import { WorkflowType } from "../components/WorkflowTypeSelector";

// import {
//   collection,
//   addDoc,
//   updateDoc,
//   doc,
//   Timestamp,
// } from "firebase/firestore";
// import { db } from "../lib/firebase";
// import { useSearchParams } from "next/navigation";

// import { SaveControls } from "../components/SaveControls";
// import { WorkflowHeader } from "./WorkflowHeader";

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
//     assignedHandler?: string;
//     steps?: any[];
//   };
// }

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

// export default function WorkflowBuilder({ initialData }: WorkflowBuilderProps) {
//   const [workflowName, setWorkflowName] = useState(initialData?.name || "");
//   const [workflowDescription, setWorkflowDescription] = useState(
//     initialData?.description || ""
//   );
//   const [workflowType, setWorkflowType] = useState<WorkflowType>(
//     initialData?.type || "email-slack"
//   );
//   const [assignedHandler, setAssignedHandler] = useState<string>(
//     initialData?.assignedHandler ||
//       getDefaultHandlerForType(initialData?.type || "email-slack")
//   );
//   const [steps, setSteps] = useState<Step[]>(
//     (initialData?.steps || []).map((s) => ({ ...s, isOpen: false })) || []
//   );
//   const [workflowId, setWorkflowId] = useState(initialData?.id || null);

//   const searchParams = useSearchParams();
//   const from = searchParams.get("from");

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

//   const handleTypeChange = (newType: WorkflowType) => {
//     setWorkflowType(newType);
//     const newHandler = getDefaultHandlerForType(newType);
//     setAssignedHandler(newHandler);
//   };

//   const [isSaving, setIsSaving] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);

//   const handleSave = async () => {
//     if (!workflowName.trim() || workflowName === defaultWorkflowName) {
//       alert("Please enter a workflow title before saving.");
//       return;
//     }

//     if (!workflowDescription.trim()) {
//       alert("Please enter a workflow description before saving.");
//       return;
//     }

//     if (!steps.length) {
//       alert("Please add at least one step before saving.");
//       return;
//     }

//     if (!steps[0].title.trim()) {
//       alert("Please enter a title for your first step before saving.");
//       return;
//     }

//     if (!steps[0].prompt.trim()) {
//       alert("Please enter an AI prompt for your first step before saving.");
//       return;
//     }

//     setIsSaving(true);
//     setSaveSuccess(false);

//     try {
//       const workflowData = {
//         name: workflowName,
//         description: workflowDescription,
//         type: workflowType,
//         assignedHandler: assignedHandler,
//         steps,
//         updatedAt: Timestamp.now(),
//       };

//       if (workflowId) {
//         await updateDoc(doc(db, "workflows", workflowId), workflowData);
//       } else {
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

//   const handleTest = () => {
//     // Placeholder for test workflow logic
//     alert("Test workflow clicked!");
//   };

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-6 py-8">
//         {/* Header Section */}
//         <WorkflowHeader
//           from={from}
//           workflowName={workflowName}
//           setWorkflowName={setWorkflowName}
//           workflowDescription={workflowDescription}
//           setWorkflowDescription={setWorkflowDescription}
//           workflowType={workflowType}
//           handleTypeChange={handleTypeChange}
//         />

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

//         {/* Use SaveControls component here */}
//         <SaveControls
//           isSaving={isSaving}
//           saveSuccess={saveSuccess}
//           disabled={
//             isSaving ||
//             !workflowName.trim() ||
//             workflowName === defaultWorkflowName ||
//             !workflowDescription.trim() ||
//             !steps.length ||
//             !steps[0]?.title.trim() ||
//             !steps[0]?.prompt.trim()
//           }
//           onSave={handleSave}
//           onTest={handleTest}
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { WorkflowStep } from "./WorkflowStep";
import { Step, defaultWorkflowName } from "./DummyData";
import { WorkflowType } from "../components/WorkflowTypeSelector";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

import { SaveControls } from "../components/SaveControls";
import { WorkflowHeader } from "./WorkflowHeader";

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
  initialData: {
    id?: string;
    name: string;
    description: string;
    type: WorkflowType;
    assignedHandler: string;
    steps: any[];
  };
}

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

export default function WorkflowBuilder({ initialData }: WorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState(initialData.name);
  const [workflowDescription, setWorkflowDescription] = useState(
    initialData.description
  );
  const [workflowType, setWorkflowType] = useState<WorkflowType>(
    initialData.type
  );
  const [assignedHandler, setAssignedHandler] = useState<string>(
    initialData.assignedHandler
  );
  const [steps, setSteps] = useState<Step[]>(
    (initialData.steps || []).map((s) => ({ ...s, isOpen: false })) || []
  );
  const [workflowId, setWorkflowId] = useState(initialData.id || null);

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
    const newHandler = getDefaultHandlerForType(newType);
    setAssignedHandler(newHandler);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!workflowName.trim() || workflowName === defaultWorkflowName) {
      alert("Please enter a workflow title before saving.");
      return;
    }

    if (!workflowDescription.trim()) {
      alert("Please enter a workflow description before saving.");
      return;
    }

    if (!steps.length) {
      alert("Please add at least one step before saving.");
      return;
    }

    if (!steps[0].title.trim()) {
      alert("Please enter a title for your first step before saving.");
      return;
    }

    if (!steps[0].prompt.trim()) {
      alert("Please enter an AI prompt for your first step before saving.");
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
        await updateDoc(doc(db, "workflows", workflowId), workflowData);
      } else {
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

  const handleTest = () => {
    // Placeholder for test workflow logic
    alert("Test workflow clicked!");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Section */}
        <WorkflowHeader
          from={null} // from is unused here since initialData controls type
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
          workflowDescription={workflowDescription}
          setWorkflowDescription={setWorkflowDescription}
          workflowType={workflowType}
          handleTypeChange={handleTypeChange}
        />

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

        {/* Use SaveControls component here */}
        <SaveControls
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          disabled={
            isSaving ||
            !workflowName.trim() ||
            workflowName === defaultWorkflowName ||
            !workflowDescription.trim() ||
            !steps.length ||
            !steps[0]?.title.trim() ||
            !steps[0]?.prompt.trim()
          }
          onSave={handleSave}
          onTest={handleTest}
        />
      </div>
    </div>
  );
}
