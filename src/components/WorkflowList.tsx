"use client";

import { useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import { useWorkflows } from "../hooks/useWorkflows";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Workflow } from "../hooks/useWorkflows";

interface WorkflowListProps {}

export const WorkflowList: React.FC<WorkflowListProps> = () => {
  const { workflows, loading } = useWorkflows();
  const [saving, setSaving] = useState(false);

  const moveStep = useCallback(
    async (workflowId: string, stepIndex: number, direction: "up" | "down") => {
      const workflow = workflows.find((w) => w.id === workflowId);
      if (!workflow) return;

      const newSteps = [...workflow.steps];
      const targetIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1;

      if (targetIndex < 0 || targetIndex >= newSteps.length) return;

      // Swap steps
      [newSteps[stepIndex], newSteps[targetIndex]] = [
        newSteps[targetIndex],
        newSteps[stepIndex],
      ];

      // Optimistic UI update (optional)
      workflow.steps = newSteps;

      // Firestore update
      setSaving(true);
      const workflowRef = doc(db, "workflows", workflowId);
      try {
        await updateDoc(workflowRef, { steps: newSteps });
      } catch (err) {
        console.error("Failed to update workflow steps:", err);
      } finally {
        setSaving(false);
      }
    },
    [workflows]
  );

  if (loading) return <p>Loading workflows...</p>;
  if (!workflows.length) return <p>No workflows found.</p>;

  return (
    <div className="space-y-6">
      {workflows.map((workflow) => (
        <div key={workflow.id} className="p-4 border rounded shadow-sm">
          <h3 className="font-semibold text-lg">{workflow.defaultTitle}</h3>
          <ol className="mt-2 space-y-2 list-decimal list-inside">
            {workflow.steps.map((step, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <div>
                  <strong>{step.title}</strong>: {step.prompt}
                </div>
                <div className="space-x-1">
                  <Button
                    size="sm"
                    disabled={idx === 0 || saving}
                    onClick={() => moveStep(workflow.id, idx, "up")}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    disabled={idx === workflow.steps.length - 1 || saving}
                    onClick={() => moveStep(workflow.id, idx, "down")}
                  >
                    ↓
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
};
