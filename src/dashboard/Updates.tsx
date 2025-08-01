"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { InfoCard } from "../components/InfoCard";
import { HandlerSelect } from "../components/HandlerSelect";
import { WorkflowCard } from "../components/WorkflowCard";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/navigation";

interface Workflow {
  id: string;
  name?: string;
  description?: string;
  assignedHandler?: string;
  [key: string]: any;
}

export function Updates() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [handlers, setHandlers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "workflows"),
      where("type", "==", "updates")
    );

    return onSnapshot(q, (snap) => {
      const workflowsData: Workflow[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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

  // Prefetch workfow.tsx once workflows cards are loaded
  useEffect(() => {
    if (workflows.length === 0) return;

    router.prefetch("/workflow/new");
    workflows.forEach((wf) => {
      router.prefetch(`/workflow/${wf.id}`);
    });
  }, [workflows]);

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

  const handleEdit = (workflowId: string) => {
    setLoading(true);
    router.push(`/workflow/${workflowId}?from=updates`);
  };

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="loader"></div>
        </div>
      )}

      {/* Header */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
              Investor updates
            </h1>
          </div>
          <div className="flex items-center text-gray-600 text-sm font-normal">
            <span>
              Edit, customize and manage workflows so we can help you create
              investor updates & board decks.{" "}
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
                onEdit={() => handleEdit(wf.id)}
                actions={
                  <HandlerSelect
                    value={handlers[wf.id] || wf.assignedHandler || ""}
                    onChange={(val) => handleHandlerChange(wf.id, val)}
                  />
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
