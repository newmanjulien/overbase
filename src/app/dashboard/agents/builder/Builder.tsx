"use client";

import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  useCallback,
} from "react";
import dynamic from "next/dynamic";

import AgentNode from "./AgentNode";
import TitleNode from "./TitleNode";
import HelperNode from "./HelperNode";

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
  onDelete: () => void;
  onAddBelow: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSave: (data: Partial<NodeData>) => void;
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
const MIN_CANVAS_HEIGHT = 800;

// ------------------- TOP & BOTTOM OFFSETS -------------------
const TOP_OFFSET = 100;
const BOTTOM_OFFSET = 60;

export default function Builder() {
  const [agentTitle, setAgentTitle] = useState("AI Agents");
  const [nodes, setNodes] = useState<AgentNodeType[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);

  const workflowId = "B1BG67XmaLgEaIvwKiM7";
  const { addStep, deleteStep, updateStep, moveStep, updateTitle } =
    useNodeActions({ workflowId });

  // ---------------- Stable callbacks ----------------
  const handleEdit = useCallback((id: string) => setEditingNodeId(id), []);
  const handleDelete = useCallback(
    (id: string) => deleteStep(id),
    [deleteStep]
  );
  const handleAddBelow = useCallback((id: string) => addStep(id), [addStep]);
  const handleMove = useCallback(
    (id: string, direction: "up" | "down") => moveStep(id, direction),
    [moveStep]
  );
  const handleSave = useCallback(
    (id: string, data: Partial<NodeData>) => updateStep(id, data),
    [updateStep]
  );

  // ---------------- Firestore listeners ----------------
  useEffect(() => {
    const workflowRef = doc(db, "playbooks", workflowId);

    const unsubWorkflow = onSnapshot(workflowRef, (snap) => {
      if (snap.exists()) {
        const raw = snap.data();
        if (raw.title && raw.title !== agentTitle)
          setAgentTitle(raw.title as string);
      }
    });

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

      setNodes((prevNodes) => {
        const same =
          prevNodes.length === fetched.length &&
          prevNodes.every(
            (n, i) =>
              n.id === fetched[i].id && n.data.title === fetched[i].title
          );
        if (same) return prevNodes;

        return fetched.map((step, index) => ({
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
            onEdit: () => handleEdit(step.id),
            onDelete: () => handleDelete(step.id),
            onAddBelow: () => handleAddBelow(step.id),
            onMoveUp: () => handleMove(step.id, "up"),
            onMoveDown: () => handleMove(step.id, "down"),
            onSave: (data) => handleSave(step.id, data),
          },
        }));
      });
    });

    return () => {
      unsubWorkflow();
      unsubSteps();
    };
  }, [
    workflowId,
    agentTitle,
    handleEdit,
    handleDelete,
    handleAddBelow,
    handleMove,
    handleSave,
  ]);

  // ---------------- Handle window resize ----------------
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

  // ---------------- Render ----------------
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
              minHeight: Math.max(
                MIN_CANVAS_HEIGHT,
                nodes.length * VERTICAL_SPACING + TOP_OFFSET + BOTTOM_OFFSET
              ),
              width: "320px", // wrapper width
            }}
          >
            {nodes.map((node, index) => (
              <div key={node.id} className="relative">
                {/* SVG Edge */}
                {index < nodes.length - 1 && (
                  <svg
                    style={{
                      position: "absolute",
                      top: TOP_OFFSET + index * VERTICAL_SPACING + 60,
                      left: 0,
                      width: "100%",
                      height: VERTICAL_SPACING - 60,
                      pointerEvents: "none",
                      overflow: "visible",
                    }}
                  >
                    <line
                      x1={176} // card width / 2
                      y1={0}
                      x2={176}
                      y2={VERTICAL_SPACING - 60}
                      stroke="#E5E7EB"
                      strokeWidth={1}
                    />
                  </svg>
                )}

                {/* Agent Node */}
                <div
                  style={{
                    position: "absolute",
                    top: TOP_OFFSET + index * VERTICAL_SPACING,
                    left: 0,
                    right: 0,
                  }}
                >
                  <AgentNode {...node} />
                </div>
              </div>
            ))}
          </div>

          <TitleNode
            title={agentTitle}
            onTitleChange={updateTitle}
            position={{ top: 24, left: 24 }}
          />
          <HelperNode position={{ bottom: 24, left: 24 }} onClick={() => {}} />

          {editingNodeId && (
            <div className="absolute top-4 right-4 w-96 h-[calc(100vh-120px)]">
              <EditNode
                node={nodes.find((n) => n.id === editingNodeId)!}
                onSave={(data) => handleSave(editingNodeId, data)}
                onClose={() => setEditingNodeId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </EditingNodeContext.Provider>
  );
}
