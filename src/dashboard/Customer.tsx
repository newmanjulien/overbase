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
import { useSection } from "./Dashboard";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { Button } from "../components/ui/button";

interface Workflow {
  id: string;
  name?: string;
  description?: string;
  assignedHandler?: string;
  [key: string]: any;
}

export function Customer() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [handlers, setHandlers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setActiveSection } = useSection();

  useEffect(() => {
    const q = query(
      collection(db, "workflows"),
      where("type", "==", "customer")
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
  }, [workflows, router]);

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
    router.push(`/workflow/${workflowId}?from=customer`);
  };

  return (
    <div>
      {loading && <LoadingOverlay />}

      {/* Header */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            {/* Left: stacked h1 and subtitle with link */}
            <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
              <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
                Customer success
              </h1>
              <h2 className="text-gray-600 text-sm font-normal mt-1">
                Manage and customize workflows that let you easily complete your
                customer success and customer support responsibilities.{" "}
                <a
                  href="#"
                  className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
                >
                  <span>Learn more</span>
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </h2>
            </div>

            {/* Right: create workflow button */}
            <Button
              onClick={() => {
                setLoading(true);
                router.push(`/workflow/new?from=customer`);
              }}
              className="font-normal bg-black text-white hover:bg-black/90 border border-transparent"
              disabled={loading}
            >
              New workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
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
              text="Copy customer succcess workflows other CEOs created so you can easily customize them"
              linkText="Templates"
              onClick={() => setActiveSection("templates")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
