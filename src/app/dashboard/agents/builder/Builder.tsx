// "use client";

// import {
//   useState,
//   useCallback,
//   useMemo,
//   useRef,
//   useEffect,
//   createContext,
//   useContext,
// } from "react";
// import {
//   ReactFlow,
//   type Node,
//   Background,
//   useNodesState,
//   type NodeTypes,
//   type ReactFlowInstance,
//   type Edge,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";

// import dynamic from "next/dynamic";

// import AgentNode from "./AgentNode";
// import TitleNode from "./TitleNode";
// import { dummyData } from "./DummyData";
// import { useAgentNodeActions } from "./useAgentNodeActions";

// const EditNode = dynamic(() => import("./EditNode"), { ssr: false });

// const VERTICAL_SPACING = 185;
// const PADDING_BELOW = 350;
// const MIN_CANVAS_HEIGHT = 800;

// const nodeTypes: NodeTypes = { agentNode: AgentNode };

// export interface NodeData {
//   [key: string]: unknown;
//   stepNumber: number;
//   title: string;
//   prompt: string;
//   conditions?: string;
//   context?: string;
//   integration?: string;
//   onEdit: (nodeId: string) => void;
//   onDelete: (nodeId: string) => void;
//   onAddBelow: (nodeId: string) => void;
//   onSave: (nodeId: string, data: Partial<NodeData>) => void;
//   nodeIndex?: number;
//   totalNodes?: number;
//   onMoveUp?: (id: string) => void;
//   onMoveDown?: (id: string) => void;
// }

// export type AgentNodeType = Node<NodeData, "agentNode">;

// interface EditingNodeContextValue {
//   editingNodeId: string | null;
//   setEditingNodeId: (id: string | null) => void;
// }
// const EditingNodeContext = createContext<EditingNodeContextValue | undefined>(
//   undefined
// );

// export const useEditingNodeContext = () => {
//   const ctx = useContext(EditingNodeContext);
//   if (!ctx)
//     throw new Error("useEditingNodeContext must be used within Provider");
//   return ctx;
// };

// export default function Builder() {
//   const flowWrapperRef = useRef<HTMLDivElement | null>(null);
//   const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

//   // ✅ Use optional chaining + fallback
//   const [agentTitle, setAgentTitle] = useState(
//     dummyData?.defaultTitle || "AI Agents"
//   );
//   const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
//   const [isInitialized, setIsInitialized] = useState(false);

//   const createInitialNodes = useCallback((): AgentNodeType[] => {
//     return (
//       dummyData?.steps.map((step, index) => ({
//         id: `${Date.now()}-${index}`,
//         type: "agentNode",
//         position: { x: 0, y: 0 },
//         style: { opacity: 0 },
//         data: {
//           stepNumber: index + 1,
//           title: step.title,
//           prompt: step.prompt,
//           conditions: step.conditions,
//           context: step.context,
//           integration: step.integration,
//           onEdit: () => {},
//           onDelete: () => {},
//           onAddBelow: () => {},
//           onSave: () => {},
//         },
//         draggable: false,
//       })) || []
//     );
//   }, []);

//   const initialNodes = useMemo(
//     () => createInitialNodes(),
//     [createInitialNodes]
//   );
//   const [nodes, setNodes] = useNodesState<AgentNodeType>(initialNodes);

//   const buildSequentialEdges = useCallback(
//     (nodeList: AgentNodeType[]): Edge[] => {
//       if (nodeList.length < 2) return [];
//       const edges: Edge[] = [];
//       for (let i = 0; i < nodeList.length - 1; i++) {
//         const a = nodeList[i];
//         const b = nodeList[i + 1];
//         edges.push({
//           id: `e-${a.id}-${b.id}`,
//           source: a.id,
//           target: b.id,
//           type: "smoothstep",
//         });
//       }
//       return edges;
//     },
//     []
//   );

//   const edges = useMemo(
//     () =>
//       buildSequentialEdges(nodes).map((edge) => ({
//         ...edge,
//         style: { stroke: "#E5E7EB", opacity: isInitialized ? 1 : 0 },
//       })),
//     [nodes, buildSequentialEdges, isInitialized]
//   );

//   const getFlowCenterX = useCallback(() => {
//     const rf = rfInstanceRef.current;
//     const wrapper = flowWrapperRef.current;
//     if (!rf || !wrapper) return 0;
//     const { x: tx, zoom } = rf.getViewport();
//     const containerWidth = wrapper.clientWidth || 1200;
//     return (containerWidth / 2 - tx) / zoom;
//   }, []);

//   const {
//     handleEditNode,
//     handleDeleteNode,
//     handleAddNodeBelow,
//     handleSaveNode,
//     handleMoveNodeUp,
//     handleMoveNodeDown,
//     updateNodesPositions,
//   } = useAgentNodeActions(nodes, setNodes, getFlowCenterX, setEditingNodeId);

//   const translateExtent: [[number, number], [number, number]] = [
//     [-200, -100],
//     [
//       1200,
//       Math.max(
//         nodes.length > 0
//           ? Math.max(
//               ...nodes.map((_, index) => 100 + index * VERTICAL_SPACING)
//             ) +
//               PADDING_BELOW +
//               (nodes.length > 0 ? 60 : 0)
//           : MIN_CANVAS_HEIGHT,
//         MIN_CANVAS_HEIGHT
//       ),
//     ],
//   ];

//   useEffect(() => {
//     const handleResize = () => setNodes(updateNodesPositions(nodes));
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [nodes, setNodes, updateNodesPositions]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       (EditNode as any).preload?.();
//     }, 1000);
//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <EditingNodeContext.Provider value={{ editingNodeId, setEditingNodeId }}>
//       <div className="h-screen flex flex-col">
//         <div ref={flowWrapperRef} className="flex-1 relative">
//           <ReactFlow
//             nodes={nodes.map((node, index) => ({
//               ...node,
//               data: {
//                 ...node.data,
//                 nodeIndex: index,
//                 totalNodes: nodes.length,
//                 onEdit: () => handleEditNode(node.id),
//                 onDelete: () => handleDeleteNode(node.id),
//                 onAddBelow: () => handleAddNodeBelow(node.id),
//                 onMoveUp: () => handleMoveNodeUp(node.id),
//                 onMoveDown: () => handleMoveNodeDown(node.id),
//                 onSave: (data: Partial<NodeData>) =>
//                   handleSaveNode(node.id, data),
//               },
//             }))}
//             edges={edges}
//             nodeTypes={nodeTypes}
//             minZoom={0.9}
//             maxZoom={0.9}
//             translateExtent={translateExtent}
//             nodesDraggable={false}
//             nodesConnectable={false}
//             panOnScroll
//             panOnDrag={false}
//             zoomOnScroll={false}
//             className="bg-gray-50"
//             fitView={false}
//             defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
//             defaultEdgeOptions={{
//               type: "smoothstep" as const,
//               style: { stroke: "#E5E7EB" },
//             }}
//             onInit={(instance) => {
//               rfInstanceRef.current = instance as unknown as ReactFlowInstance;
//               setNodes(updateNodesPositions(nodes));
//               setIsInitialized(true);
//             }}
//           >
//             <Background color="#fafafa" gap={25} size={1} />
//           </ReactFlow>

//           <div className="absolute top-4 left-4 z-10">
//             <TitleNode title={agentTitle} onTitleChange={setAgentTitle} />
//           </div>

//           {editingNodeId && (
//             <div className="absolute top-4 right-4 w-96 h-[calc(100vh-120px)]">
//               <EditNode
//                 node={nodes.find((n) => n.id === editingNodeId)!}
//                 onSave={(data) => handleSaveNode(editingNodeId, data)}
//                 onClose={() => setEditingNodeId(null)}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </EditingNodeContext.Provider>
//   );
// }

"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import {
  ReactFlow,
  type Node,
  Background,
  useNodesState,
  type NodeTypes,
  type ReactFlowInstance,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import dynamic from "next/dynamic";

import AgentNode from "./AgentNode";
import TitleNode from "./TitleNode";
import { dummyData } from "./DummyData";
import { useAgentNodeActions } from "./useAgentNodeActions";

// --- Dynamically import EditNode ---
const EditNode = dynamic(() => import("./EditNode"), { ssr: false });

// --- TypeScript type for static preload method ---
interface EditNodeWithPreload {
  preload?: () => void;
}

const EditNodeTyped = EditNode as unknown as EditNodeWithPreload;

const VERTICAL_SPACING = 185;
const PADDING_BELOW = 350;
const MIN_CANVAS_HEIGHT = 800;

const nodeTypes: NodeTypes = { agentNode: AgentNode };

export interface NodeData {
  [key: string]: unknown;
  stepNumber: number;
  title: string;
  prompt: string;
  conditions?: string;
  context?: string;
  integration?: string;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddBelow: (nodeId: string) => void;
  onSave: (nodeId: string, data: Partial<NodeData>) => void;
  nodeIndex?: number;
  totalNodes?: number;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

export type AgentNodeType = Node<NodeData, "agentNode">;

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

export default function Builder() {
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const [agentTitle, setAgentTitle] = useState(
    dummyData?.defaultTitle || "AI Agents"
  );
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const createInitialNodes = useCallback((): AgentNodeType[] => {
    return (
      dummyData?.steps.map((step, index) => ({
        id: `${Date.now()}-${index}`,
        type: "agentNode",
        position: { x: 0, y: 0 },
        style: { opacity: 0 },
        data: {
          stepNumber: index + 1,
          title: step.title,
          prompt: step.prompt,
          conditions: step.conditions,
          context: step.context,
          integration: step.integration,
          onEdit: () => {},
          onDelete: () => {},
          onAddBelow: () => {},
          onSave: () => {},
        },
        draggable: false,
      })) || []
    );
  }, []);

  const initialNodes = useMemo(
    () => createInitialNodes(),
    [createInitialNodes]
  );
  const [nodes, setNodes] = useNodesState<AgentNodeType>(initialNodes);

  const buildSequentialEdges = useCallback(
    (nodeList: AgentNodeType[]): Edge[] => {
      if (nodeList.length < 2) return [];
      const edges: Edge[] = [];
      for (let i = 0; i < nodeList.length - 1; i++) {
        const a = nodeList[i];
        const b = nodeList[i + 1];
        edges.push({
          id: `e-${a.id}-${b.id}`,
          source: a.id,
          target: b.id,
          type: "smoothstep",
        });
      }
      return edges;
    },
    []
  );

  const edges = useMemo(
    () =>
      buildSequentialEdges(nodes).map((edge) => ({
        ...edge,
        style: { stroke: "#E5E7EB", opacity: isInitialized ? 1 : 0 },
      })),
    [nodes, buildSequentialEdges, isInitialized]
  );

  const getFlowCenterX = useCallback(() => {
    const rf = rfInstanceRef.current;
    const wrapper = flowWrapperRef.current;
    if (!rf || !wrapper) return 0;
    const { x: tx, zoom } = rf.getViewport();
    const containerWidth = wrapper.clientWidth || 1200;
    return (containerWidth / 2 - tx) / zoom;
  }, []);

  const {
    handleEditNode,
    handleDeleteNode,
    handleAddNodeBelow,
    handleSaveNode,
    handleMoveNodeUp,
    handleMoveNodeDown,
    updateNodesPositions,
  } = useAgentNodeActions(nodes, setNodes, getFlowCenterX, setEditingNodeId);

  const translateExtent: [[number, number], [number, number]] = [
    [-200, -100],
    [
      1200,
      Math.max(
        nodes.length > 0
          ? Math.max(
              ...nodes.map((_, index) => 100 + index * VERTICAL_SPACING)
            ) +
              PADDING_BELOW +
              (nodes.length > 0 ? 60 : 0)
          : MIN_CANVAS_HEIGHT,
        MIN_CANVAS_HEIGHT
      ),
    ],
  ];

  useEffect(() => {
    const handleResize = () => setNodes(updateNodesPositions(nodes));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [nodes, setNodes, updateNodesPositions]);

  // --- Preload EditNode safely with proper typing ---
  useEffect(() => {
    const timer = setTimeout(() => {
      EditNodeTyped.preload?.();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <EditingNodeContext.Provider value={{ editingNodeId, setEditingNodeId }}>
      <div className="h-screen flex flex-col">
        <div ref={flowWrapperRef} className="flex-1 relative">
          <ReactFlow
            nodes={nodes.map((node, index) => ({
              ...node,
              data: {
                ...node.data,
                nodeIndex: index,
                totalNodes: nodes.length,
                onEdit: () => handleEditNode(node.id),
                onDelete: () => handleDeleteNode(node.id),
                onAddBelow: () => handleAddNodeBelow(node.id),
                onMoveUp: () => handleMoveNodeUp(node.id),
                onMoveDown: () => handleMoveNodeDown(node.id),
                onSave: (data: Partial<NodeData>) =>
                  handleSaveNode(node.id, data),
              },
            }))}
            edges={edges}
            nodeTypes={nodeTypes}
            minZoom={0.9}
            maxZoom={0.9}
            translateExtent={translateExtent}
            nodesDraggable={false}
            nodesConnectable={false}
            panOnScroll
            panOnDrag={false}
            zoomOnScroll={false}
            className="bg-gray-50"
            fitView={false}
            defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
            defaultEdgeOptions={{
              type: "smoothstep" as const,
              style: { stroke: "#E5E7EB" },
            }}
            onInit={(instance) => {
              rfInstanceRef.current = instance as unknown as ReactFlowInstance;
              setNodes(updateNodesPositions(nodes));
              setIsInitialized(true);
            }}
          >
            <Background color="#DDDDDD" gap={30} size={2} />
          </ReactFlow>

          <div className="absolute top-4 left-4 z-10">
            <TitleNode title={agentTitle} onTitleChange={setAgentTitle} />
          </div>

          {editingNodeId && (
            <div className="absolute top-4 right-4 w-96 h-[calc(100vh-120px)]">
              <EditNode
                node={nodes.find((n) => n.id === editingNodeId)!}
                onSave={(data) => handleSaveNode(editingNodeId, data)}
                onClose={() => setEditingNodeId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </EditingNodeContext.Provider>
  );
}
