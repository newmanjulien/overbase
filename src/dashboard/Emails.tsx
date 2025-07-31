// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "../components/ui/button";
// import { ExternalLink } from "lucide-react";
// import { InfoCard } from "../components/InfoCard";
// import { HandlerSelect } from "../components/HandlerSelect";
// import { WorkflowCard } from "../components/WorkflowCard";
// import { collection, onSnapshot } from "firebase/firestore";
// import { db } from "../lib/firebase";

// const DEFAULT_HANDLER = "1";

// export function Emails() {
//   const [workflows, setWorkflows] = useState<any[]>([]);
//   const [handlers, setHandlers] = useState<Record<string, string>>({});

//   useEffect(() => {
//     return onSnapshot(collection(db, "workflows"), (snap) => {
//       setWorkflows(
//         snap.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }))
//       );
//     });
//   }, []);

//   return (
//     <div>
//       {/* Header */}
//       <div
//         className="border-b border-gray-200/60"
//         style={{ backgroundColor: "#FAFAFA" }}
//       >
//         <div className="max-w-5xl mx-auto px-6 py-10">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
//               Triage emails
//             </h1>
//           </div>
//           <div className="flex items-center text-gray-600 text-sm font-normal">
//             <span>
//               Edit, customize and manage workflows so we can help you triage
//               emails.{" "}
//             </span>
//             <a
//               href="#"
//               className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
//             >
//               <span>Learn more</span>
//               <ExternalLink className="ml-1 h-4 w-4" />
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div style={{ backgroundColor: "#FAFAFA" }}>
//         <div className="max-w-5xl mx-auto px-6 py-16">
//           <div className="w-full flex flex-col gap-4">
//             {workflows.map((wf) => (
//               <WorkflowCard
//                 key={wf.id}
//                 id={wf.id}
//                 title={wf.name || "Untitled Workflow"}
//                 subtitle={wf.description || ""}
//                 image={undefined}
//                 actions={
//                   <>
//                     <Button
//                       variant="ghost"
//                       className="text-gray-700 hover:bg-[#f7fef7] font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
//                     >
//                       Launch
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       className="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
//                     >
//                       Edit
//                     </Button>
//                     <HandlerSelect
//                       value={handlers[wf.id] ?? ""}
//                       onChange={(val) =>
//                         setHandlers((prev) => ({ ...prev, [wf.id]: val }))
//                       }
//                     />
//                   </>
//                 }
//               />
//             ))}
//           </div>

//           <div className="mt-8 w-full">
//             <InfoCard
//               text="Build custom workflows to automate your email processing and responses"
//               href="#workflow-help"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { ExternalLink } from "lucide-react";
import { InfoCard } from "../components/InfoCard";
import { HandlerSelect } from "../components/HandlerSelect";
import { WorkflowCard } from "../components/WorkflowCard";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const DEFAULT_HANDLER_ID = "3";

interface Workflow {
  id: string;
  name?: string;
  description?: string;
  assignedHandler?: string;
  [key: string]: any; // Allow for additional properties
}

export function Emails() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [handlers, setHandlers] = useState<Record<string, string>>({});

  useEffect(() => {
    return onSnapshot(collection(db, "workflows"), async (snap) => {
      const workflowsData: Workflow[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check for workflows without assigned handlers and assign default
      for (const workflow of workflowsData) {
        if (!workflow.assignedHandler) {
          try {
            await updateDoc(doc(db, "workflows", workflow.id), {
              assignedHandler: DEFAULT_HANDLER_ID,
            });
            console.log(
              `Assigned default handler ${DEFAULT_HANDLER_ID} to workflow ${workflow.id}`
            );
          } catch (error) {
            console.error(
              `Failed to assign handler to workflow ${workflow.id}:`,
              error
            );
          }
        }
      }

      setWorkflows(workflowsData);

      // Initialize handlers state with existing assigned handlers
      const initialHandlers: Record<string, string> = {};
      workflowsData.forEach((wf) => {
        if (wf.assignedHandler) {
          initialHandlers[wf.id] = wf.assignedHandler;
        }
      });
      setHandlers(initialHandlers);
    });
  }, []);

  const handleHandlerChange = async (workflowId: string, handlerId: string) => {
    try {
      // Update in Firebase
      await updateDoc(doc(db, "workflows", workflowId), {
        assignedHandler: handlerId,
      });

      // Update local state
      setHandlers((prev) => ({ ...prev, [workflowId]: handlerId }));
    } catch (error) {
      console.error(
        `Failed to update handler for workflow ${workflowId}:`,
        error
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
              Triage emails
            </h1>
          </div>
          <div className="flex items-center text-gray-600 text-sm font-normal">
            <span>
              Edit, customize and manage workflows so we can help you triage
              emails.{" "}
            </span>
            <a
              href="#"
              className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
            >
              <span>Learn more</span>
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="w-full flex flex-col gap-4">
            {workflows.map((wf, index) => (
              <WorkflowCard
                key={wf.id}
                id={parseInt(wf.id) || index + 1}
                title={wf.name || "Untitled Workflow"}
                subtitle={wf.description || ""}
                image="/images/gmail.png"
                actions={
                  <>
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-[#f7fef7] font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
                    >
                      Launch
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
                    >
                      Edit
                    </Button>
                    <HandlerSelect
                      value={handlers[wf.id] || wf.assignedHandler || ""}
                      onChange={(val) => handleHandlerChange(wf.id, val)}
                    />
                  </>
                }
              />
            ))}
          </div>

          <div className="mt-8 w-full">
            <InfoCard
              text="Build custom workflows to automate your email processing and responses"
              href="#workflow-help"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
