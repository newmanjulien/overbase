// "use client";

// import { useState, useCallback, useMemo, useRef, useEffect } from "react";
// import {
//   ReactFlow,
//   type Node,
//   Background,
//   useNodesState,
//   useEdgesState,
//   type NodeTypes,
//   type ReactFlowInstance,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";

// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import AgentNodeComponent from "./AgentNode";
// import EditingNodeComponent from "./EditingNode";

// // Constants
// const CARD_WIDTH_FALLBACK = 320;   // used if we can't measure the node width
// const VERTICAL_SPACING = 200;

// // NodeData interface
// export interface NodeData {
//   [key: string]: unknown;
//   stepNumber: number;
//   title: string;
//   prompt: string;
//   context?: string;
//   onEdit: (nodeId: string) => void;
//   onDelete: (nodeId: string) => void;
//   onAddBelow: (nodeId: string) => void;
//   onSave: (nodeId: string, data: Partial<NodeData>) => void;
// }

// // Node types
// export type AgentNodeType = Node<NodeData, "agentNode">;

// const generateNodeId = () =>
//   `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// export default function AgentBuilder() {
//   const flowWrapperRef = useRef<HTMLDivElement | null>(null);
//   const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

//   const [agentTitle, setAgentTitle] = useState("AI Agents");
//   const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState<string | null>(null);

//   // Initial node (x will be re-centered after mount)
//   const createInitialNode = useCallback(
//     (): AgentNodeType => ({
//       id: generateNodeId(),
//       type: "agentNode",
//       position: { x: 0, y: 100 }, // centered later once RF instance is ready
//       data: {
//         stepNumber: 1,
//         title: "Add title",
//         prompt: "Write prompt",
//         context: "",
//         onEdit: () => {},
//         onDelete: () => {},
//         onAddBelow: () => {},
//         onSave: () => {},
//       },
//       draggable: false,
//     }),
//     []
//   );

//   const initialNodes = useMemo(() => [createInitialNode()], [createInitialNode]);
//   const [nodes, setNodes, onNodesChange] = useNodesState<AgentNodeType>(initialNodes);
//   const [edges, , onEdgesChange] = useEdgesState([]);

//   /**
//    * Compute the flow-space X coordinate that corresponds to the visual center
//    * of the React Flow container, taking current viewport translate & zoom into account.
//    */
//   const getFlowCenterX = useCallback(() => {
//     const rf = rfInstanceRef.current;
//     const wrapper = flowWrapperRef.current;
//     if (!rf || !wrapper) return 0;

//     const { x: tx, zoom } = rf.getViewport(); // translate X (screen px) & zoom
//     const containerWidth = wrapper.clientWidth || 1200;

//     // Convert the visible center (containerWidth/2 in screen px) to flow coords.
//     // screen->flow: flowX = (screenX - tx) / zoom
//     return (containerWidth / 2 - tx) / zoom;
//   }, []);

//   /**
//    * Try to measure the actual rendered width of a node by its DOM element.
//    * Falls back to CARD_WIDTH_FALLBACK if not yet measured/rendered.
//    */
//   const getNodeWidth = useCallback((nodeId: string) => {
//     const wrapper = flowWrapperRef.current;
//     if (!wrapper) return CARD_WIDTH_FALLBACK;
//     const el = wrapper.querySelector(`.react-flow__node[data-id="${nodeId}"]`) as HTMLDivElement | null;
//     return el?.clientWidth ?? CARD_WIDTH_FALLBACK;
//   }, []);

//   /** ---------- Recompute positions & step numbers (always horizontally centered) ---------- */
//   const updateNodesPositions = useCallback((nodeList: AgentNodeType[]) => {
//     const flowCenterX = getFlowCenterX();
//     return nodeList
//       .slice() // avoid mutating original
//       .sort((a, b) => a.position.y - b.position.y)
//       .map((node, index) => {
//         const width = getNodeWidth(node.id);
//         const centeredLeftX = flowCenterX - width / 2;
//         return {
//           ...node,
//           position: { x: centeredLeftX, y: 100 + index * VERTICAL_SPACING },
//           data: { ...node.data, stepNumber: index + 1 },
//         };
//       });
//   }, [getFlowCenterX, getNodeWidth]);

//   /** ---------- Node Handlers ---------- */
//   const handleEditNode = useCallback((nodeId: string) => setEditingNodeId(nodeId), []);

//   const handleDeleteNode = useCallback(
//     (nodeId: string) => {
//       setNodes((nds) => updateNodesPositions(nds.filter((node) => node.id !== nodeId)));
//       if (editingNodeId === nodeId) setEditingNodeId(null);
//     },
//     [setNodes, editingNodeId, updateNodesPositions]
//   );

//   const handleAddNodeBelow = useCallback(
//     (nodeId: string) => {
//       setNodes((nds) => {
//         const currentNodeIndex = nds.findIndex((node) => node.id === nodeId);
//         if (currentNodeIndex === -1) return nds;

//         const newNode: AgentNodeType = {
//           id: generateNodeId(),
//           type: "agentNode",
//           position: { x: 0, y: 0 }, // will be recalculated
//           data: {
//             stepNumber: 0,
//             title: "Add title",
//             prompt: "Write prompt",
//             context: "",
//             onEdit: () => {},
//             onDelete: () => {},
//             onAddBelow: () => {},
//             onSave: () => {},
//           },
//           draggable: false,
//         };

//         const updatedNodes = [...nds];
//         updatedNodes.splice(currentNodeIndex + 1, 0, newNode);

//         return updateNodesPositions(updatedNodes);
//       });
//     },
//     [setNodes, updateNodesPositions]
//   );

//   const handleSaveNode = useCallback(
//     (nodeId: string, data: Partial<NodeData>) => {
//       setNodes((nds) =>
//         updateNodesPositions(
//           nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node))
//         )
//       );
//       setEditingNodeId(null);
//     },
//     [setNodes, updateNodesPositions]
//   );

//   // Add callbacks to nodes
//   const nodesWithCallbacks = useMemo(
//     () =>
//       nodes.map((node) => ({
//         ...node,
//         data: {
//           ...node.data,
//           onEdit: handleEditNode,
//           onDelete: handleDeleteNode,
//           onAddBelow: handleAddNodeBelow,
//           onSave: handleSaveNode,
//         },
//       })),
//     [nodes, handleEditNode, handleDeleteNode, handleAddNodeBelow, handleSaveNode]
//   );

//   const nodeTypes: NodeTypes = useMemo(() => ({ agentNode: AgentNodeComponent }), []);

//   /** ---------- Save Agent ---------- */
//   const handleSaveAgent = async () => {
//     setIsSaving(true);
//     setSaveMessage(null);
//     try {
//       const agentData = {
//         title: agentTitle.trim() || "Untitled Agent",
//         nodes: nodes.map(({ data }) => ({
//           stepNumber: data.stepNumber,
//           title: data.title,
//           prompt: data.prompt,
//           context: data.context || "",
//         })),
//         createdAt: new Date().toISOString(),
//       };
//       console.log("Agent Data:", agentData);
//       await new Promise((r) => setTimeout(r, 500));
//       setSaveMessage("Agent saved successfully!");
//       setTimeout(() => setSaveMessage(null), 3000);
//     } catch (error) {
//       console.error(error);
//       setSaveMessage("Failed to save agent");
//       setTimeout(() => setSaveMessage(null), 3000);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const editingNode = editingNodeId ? nodes.find((n) => n.id === editingNodeId) : null;

//   /** ---------- Init + resize recentering ---------- */
//   useEffect(() => {
//     const onResize = () => {
//       setNodes((nds) => updateNodesPositions(nds));
//     };
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, [setNodes, updateNodesPositions]);

//   return (
//     <div className="h-screen flex flex-col">
//       {/* Header */}
//       <header className="bg-black text-white p-4 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <h1 className="text-lg font-semibold">Agent Builder</h1>
//           <div className="w-px h-6 bg-gray-600"></div>
//           <Input
//             value={agentTitle}
//             onChange={(e) => setAgentTitle(e.target.value)}
//             className="bg-transparent border-gray-600 text-white max-w-md focus:border-gray-400 focus:ring-gray-400 placeholder:text-gray-400"
//             placeholder="Enter agent title"
//           />
//         </div>
//         <div className="flex items-center gap-3">
//           {saveMessage && (
//             <span
//               className={`text-sm ${
//                 saveMessage.includes("success") ? "text-green-400" : "text-red-400"
//               }`}
//             >
//               {saveMessage}
//             </span>
//           )}
//           <Button
//             onClick={handleSaveAgent}
//             disabled={isSaving}
//             variant="secondary"
//             className="bg-white text-black hover:bg-gray-100 disabled:opacity-50"
//           >
//             {isSaving ? "Saving..." : "Save"}
//           </Button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div ref={flowWrapperRef} className="flex-1 relative">
//         <ReactFlow
//           nodes={nodesWithCallbacks}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           nodeTypes={nodeTypes}
//           minZoom={0.9}
//           maxZoom={0.9}
//           translateExtent={[
//             [-200, -100],
//             [1200, 2000],
//           ]}
//           nodesDraggable={false}
//           nodesConnectable={false}
//           panOnScroll
//           zoomOnScroll={false}
//           className="bg-gray-50"
//           fitView={false}
//           defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
//           onInit={(instance) => {
//             rfInstanceRef.current = instance;
//             // center once the instance knows its viewport
//             setNodes((nds) => updateNodesPositions(nds));
//           }}
//         >
//           <Background color="#fafafa" gap={20} size={1} />
//         </ReactFlow>

//         {/* Editing Panel */}
//         {editingNode && (
//           <div className="absolute top-4 right-4 w-96 h-[calc(100vh-120px)] bg-white rounded-lg border border-gray-200 overflow-hidden">
//             <EditingNodeComponent
//               node={editingNode}
//               onSave={(data) => handleSaveNode(editingNode.id, data)}
//               onClose={() => setEditingNodeId(null)}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  ReactFlow,
  type Node,
  Background,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AgentNodeComponent from "./AgentNode";
import EditingNodeComponent from "./EditingNode";

// Constants
const CARD_WIDTH_FALLBACK = 320;
const VERTICAL_SPACING = 200;
const PADDING_BELOW = 300; // extra space below last node
const MIN_CANVAS_HEIGHT = 800; // minimum height of canvas

// NodeData interface
export interface NodeData {
  [key: string]: unknown;
  stepNumber: number;
  title: string;
  prompt: string;
  context?: string;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddBelow: (nodeId: string) => void;
  onSave: (nodeId: string, data: Partial<NodeData>) => void;
}

// Node types
export type AgentNodeType = Node<NodeData, "agentNode">;

const generateNodeId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function AgentBuilder() {
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const [agentTitle, setAgentTitle] = useState("AI Agents");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Initial node
  const createInitialNode = useCallback(
    (): AgentNodeType => ({
      id: generateNodeId(),
      type: "agentNode",
      position: { x: 0, y: 100 },
      data: {
        stepNumber: 1,
        title: "Add title",
        prompt: "Write prompt",
        context: "",
        onEdit: () => {},
        onDelete: () => {},
        onAddBelow: () => {},
        onSave: () => {},
      },
      draggable: false,
    }),
    []
  );

  const initialNodes = useMemo(() => [createInitialNode()], [createInitialNode]);
  const [nodes, setNodes, onNodesChange] = useNodesState<AgentNodeType>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([]);

  const getFlowCenterX = useCallback(() => {
    const rf = rfInstanceRef.current;
    const wrapper = flowWrapperRef.current;
    if (!rf || !wrapper) return 0;

    const { x: tx, zoom } = rf.getViewport();
    const containerWidth = wrapper.clientWidth || 1200;
    return (containerWidth / 2 - tx) / zoom;
  }, []);

  const getNodeWidth = useCallback((nodeId: string) => {
    const wrapper = flowWrapperRef.current;
    if (!wrapper) return CARD_WIDTH_FALLBACK;
    const el = wrapper.querySelector(`.react-flow__node[data-id="${nodeId}"]`) as HTMLDivElement | null;
    return el?.clientWidth ?? CARD_WIDTH_FALLBACK;
  }, []);

  const updateNodesPositions = useCallback((nodeList: AgentNodeType[]) => {
    const flowCenterX = getFlowCenterX();
    
    // Sort nodes by their current Y position to maintain order
    const sortedNodes = nodeList
      .slice()
      .sort((a, b) => a.position.y - b.position.y);
    
    // Assign new positions based on the sorted order
    return sortedNodes.map((node, index) => {
      const width = getNodeWidth(node.id);
      const centeredLeftX = flowCenterX - width / 2;
      return {
        ...node,
        position: { x: centeredLeftX, y: 100 + index * VERTICAL_SPACING },
        data: { ...node.data, stepNumber: index + 1 },
      };
    });
  }, [getFlowCenterX, getNodeWidth]);

  const handleEditNode = useCallback((nodeId: string) => setEditingNodeId(nodeId), []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => updateNodesPositions(nds.filter((node) => node.id !== nodeId)));
      if (editingNodeId === nodeId) setEditingNodeId(null);
    },
    [setNodes, editingNodeId, updateNodesPositions]
  );

  const handleAddNodeBelow = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const currentNodeIndex = nds.findIndex((node) => node.id === nodeId);
        if (currentNodeIndex === -1) return nds;

        // Get the current node's Y position to place the new node below it
        const currentNode = nds[currentNodeIndex];
        const newYPosition = currentNode.position.y + VERTICAL_SPACING;

        const newNode: AgentNodeType = {
          id: generateNodeId(),
          type: "agentNode",
          position: { x: currentNode.position.x, y: newYPosition },
          data: {
            stepNumber: 0,
            title: "Add title",
            prompt: "Write prompt",
            context: "",
            onEdit: () => {},
            onDelete: () => {},
            onAddBelow: () => {},
            onSave: () => {},
          },
          draggable: false,
        };

        // Insert the new node after the current node
        const updatedNodes = [...nds];
        updatedNodes.splice(currentNodeIndex + 1, 0, newNode);
        
        // Update positions to ensure proper vertical ordering
        return updateNodesPositions(updatedNodes);
      });
    },
    [setNodes, updateNodesPositions]
  );

  const handleSaveNode = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
      setNodes((nds) =>
        updateNodesPositions(
          nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node))
        )
      );
      setEditingNodeId(null);
    },
    [setNodes, updateNodesPositions]
  );

  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onEdit: handleEditNode,
          onDelete: handleDeleteNode,
          onAddBelow: handleAddNodeBelow,
          onSave: handleSaveNode,
        },
      })),
    [nodes, handleEditNode, handleDeleteNode, handleAddNodeBelow, handleSaveNode]
  );

  const nodeTypes: NodeTypes = useMemo(() => ({ agentNode: AgentNodeComponent }), []);

  const handleSaveAgent = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const agentData = {
        title: agentTitle.trim() || "Untitled Agent",
        nodes: nodes.map(({ data }) => ({
          stepNumber: data.stepNumber,
          title: data.title,
          prompt: data.prompt,
          context: data.context || "",
        })),
        createdAt: new Date().toISOString(),
      };
      console.log("Agent Data:", agentData);
      await new Promise((r) => setTimeout(r, 500));
      setSaveMessage("Agent saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setSaveMessage("Failed to save agent");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const editingNode = editingNodeId ? nodes.find((n) => n.id === editingNodeId) : null;

  // Compute dynamic canvas bounds
  const computeTranslateExtent = useCallback(() => {
    const maxY =
      nodes.length > 0
        ? Math.max(...nodes.map((n) => n.position.y)) + PADDING_BELOW
        : MIN_CANVAS_HEIGHT;
    return [
      [-200, -100],
      [1200, Math.max(maxY, MIN_CANVAS_HEIGHT)],
    ] as [[number, number], [number, number]];
  }, [nodes]);

  useEffect(() => {
    const onResize = () => {
      setNodes((nds) => updateNodesPositions(nds));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setNodes, updateNodesPositions]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Agent Builder</h1>
          <div className="w-px h-6 bg-gray-600"></div>
          <Input
            value={agentTitle}
            onChange={(e) => setAgentTitle(e.target.value)}
            className="bg-transparent border-gray-600 text-white max-w-md focus:border-gray-400 focus:ring-gray-400 placeholder:text-gray-400"
            placeholder="Enter agent title"
          />
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.includes("success") ? "text-green-400" : "text-red-400"
              }`}
            >
              {saveMessage}
            </span>
          )}
          <Button
            onClick={handleSaveAgent}
            disabled={isSaving}
            variant="secondary"
            className="bg-white text-black hover:bg-gray-100 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div ref={flowWrapperRef} className="flex-1 relative">
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          minZoom={0.9}
          maxZoom={0.9}
          translateExtent={computeTranslateExtent()}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnScroll
          zoomOnScroll={false}
          className="bg-gray-50"
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          onInit={(instance) => {
            rfInstanceRef.current = instance;
            setNodes((nds) => updateNodesPositions(nds));
          }}
        >
          <Background color="#fafafa" gap={20} size={1} />
        </ReactFlow>

        {/* Editing Panel */}
        {editingNode && (
          <div className="absolute top-4 right-4 w-96 h-[calc(100vh-120px)] bg-white rounded-lg border border-gray-200 overflow-hidden">
            <EditingNodeComponent
              node={editingNode}
              onSave={(data) => handleSaveNode(editingNode.id, data)}
              onClose={() => setEditingNodeId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
