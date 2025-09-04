"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import AgentNode from "./AgentNode";
import TitleNode from "./TitleNode";
import HelperNode from "./HelperNode";
import dynamic from "next/dynamic";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useNodeActions } from "../../../../hooks/useNodeActions";

const EditNode = dynamic(() => import("./EditNode"), { ssr: false });

export interface NodeData {
  [key: string]: unknown;
  stepNumber: number;
  title: string;
  prompt: string;
  conditions?: string;
  context?: string;
  integration?: string;
  nodeIndex?: number;
  totalNodes?: number;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onAddBelow: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onSave: (id: string, data: Partial<NodeData>) => void;
}

export type AgentNodeType = {
  id: string;
  data: NodeData;
};

interface EditingNodeContextValue {
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
}
const EditingNodeContext = createContext<EditingNodeContextValue | undefined>(
  undefined
);
export const useEditingNodeContext = () => {
  const ctx = useContext(EditingNodeContext);
  if (!ctx)
    throw new Error("useEditingNodeContext must be used within Provider");
  return ctx;
};

interface FirestoreStep {
  id: string;
  title: string;
  prompt: string;
  conditions?: string;
  context?: string;
  integration?: string;
  order: number;
}

const VERTICAL_SPACING = 185;
const PADDING_BELOW = 350;
const MIN_CANVAS_HEIGHT = 800;

export default function Builder() {
  const [agentTitle, setAgentTitle] = useState("AI Agents");
  const [nodes, setNodes] = useState<AgentNodeType[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const flowWrapperRef = useRef<HTMLDivElement | null>(null);

  const workflowId = "B1BG67XmaLgEaIvwKiM7";
  const { addStep, deleteStep, updateStep, moveStep, updateTitle } =
    useNodeActions({ workflowId });

  // ---------------- Firestore listeners ----------------
  useEffect(() => {
    const unsubWorkflow = onSnapshot(
      doc(db, "playbooks", workflowId),
      (snap) => {
        if (snap.exists()) {
          const raw = snap.data();
          if (raw.title) setAgentTitle(raw.title as string);
        }
      }
    );

    const stepsRef = collection(db, "playbooks", workflowId, "steps");
    const q = query(stepsRef, orderBy("order", "asc"));
    const unsubSteps = onSnapshot(q, (snapshot) => {
      const fetched: FirestoreStep[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          title: (raw.title as string) ?? "",
          prompt: (raw.prompt as string) ?? "",
          conditions: (raw.conditions as string) ?? "",
          context: (raw.context as string) ?? "",
          integration: (raw.integration as string) ?? "",
          order: (raw.order as number) ?? 0,
        };
      });

      const builtNodes: AgentNodeType[] = fetched.map((step, index) => ({
        id: step.id,
        data: {
          stepNumber: index + 1,
          title: step.title,
          prompt: step.prompt,
          conditions: step.conditions,
          context: step.context,
          integration: step.integration,
          nodeIndex: index,
          totalNodes: fetched.length,
          onEdit: () => setEditingNodeId(step.id),
          onDelete: (id: string) => deleteStep(id),
          onAddBelow: (id: string) => addStep(id),
          onMoveUp: (id: string) => moveStep(id, "up"),
          onMoveDown: (id: string) => moveStep(id, "down"),
          onSave: (_id: string, data: Partial<NodeData>) =>
            updateStep(step.id, data),
        },
      }));

      setNodes(builtNodes);
    });

    return () => {
      unsubWorkflow();
      unsubSteps();
    };
  }, [workflowId, addStep, deleteStep, updateStep, moveStep]);

  // Handle window resize: keep nodes centered
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      if (flowWrapperRef.current)
        setContainerWidth(flowWrapperRef.current.clientWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <EditingNodeContext.Provider value={{ editingNodeId, setEditingNodeId }}>
      <div className="h-screen flex flex-col">
        <div
          ref={flowWrapperRef}
          className="flex-1 relative bg-gray-50 overflow-auto"
        >
          {/* Vertical Stack */}
          <div
            className="relative mx-auto"
            style={{
              minHeight: MIN_CANVAS_HEIGHT,
              width: "320px", // match node width
              paddingBottom: PADDING_BELOW,
            }}
          >
            {nodes.map((node, index) => (
              <div key={node.id} className="relative">
                <div
                  style={{
                    position: "absolute",
                    top: index * VERTICAL_SPACING,
                    left: 0,
                    right: 0,
                  }}
                >
                  <AgentNode {...node} />
                </div>

                {/* Edge to next node */}
                {index < nodes.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: (index + 1) * VERTICAL_SPACING - 60, // leave gap for AddStepButton
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 2,
                      height: VERTICAL_SPACING - 20,
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <TitleNode
            title={agentTitle}
            onTitleChange={updateTitle}
            position={{ top: 24, left: 24 }}
          />
          <HelperNode
            position={{ bottom: 24, left: 24 }}
            onClick={() => console.log("star clicked")}
          />

          {editingNodeId && (
            <div className="absolute top-4 right-4 w-96 h-[calc(100vh-120px)]">
              <EditNode
                node={nodes.find((n) => n.id === editingNodeId)!}
                onSave={(data) => updateStep(editingNodeId, data)}
                onClose={() => setEditingNodeId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </EditingNodeContext.Provider>
  );
}
