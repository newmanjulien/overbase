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

import AgentNodeComponent from "./AgentNode";
import EditingNodeComponent from "./EditingNode";
import TitleNode from "./TitleNode";

const CARD_WIDTH_FALLBACK = 320;
const VERTICAL_SPACING = 160;
const PADDING_BELOW = 350;
const MIN_CANVAS_HEIGHT = 800;

export interface NodeData {
  [key: string]: unknown;
  stepNumber: number;
  title?: string;
  prompt?: string;
  context?: string;
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

const generateNodeId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function Builder() {
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const [agentTitle, setAgentTitle] = useState("AI Agents");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const createInitialNode = useCallback(
    (): AgentNodeType => ({
      id: generateNodeId(),
      type: "agentNode",
      position: { x: 0, y: 450 },
      data: {
        stepNumber: 1,
        onEdit: () => {},
        onDelete: () => {},
        onAddBelow: () => {},
        onSave: () => {},
      },
      draggable: false,
    }),
    []
  );

  const initialNodes = useMemo(
    () => [createInitialNode()],
    [createInitialNode]
  );
  const [nodes, setNodes, onNodesChange] =
    useNodesState<AgentNodeType>(initialNodes);
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
    const el = wrapper.querySelector(
      `.react-flow__node[data-id="${nodeId}"]`
    ) as HTMLDivElement | null;
    return el?.clientWidth ?? CARD_WIDTH_FALLBACK;
  }, []);

  // FIXED: Uses array order, not Y-based sorting
  const updateNodesPositions = useCallback(
    (nodeList: AgentNodeType[]) => {
      const flowCenterX = getFlowCenterX();

      return nodeList.map((node, index) => {
        const width = getNodeWidth(node.id);
        const centeredLeftX = flowCenterX - width / 2;
        return {
          ...node,
          position: { x: centeredLeftX, y: 100 + index * VERTICAL_SPACING },
          data: { ...node.data, stepNumber: index + 1 },
        };
      });
    },
    [getFlowCenterX, getNodeWidth]
  );

  const handleEditNode = useCallback(
    (nodeId: string) => setEditingNodeId(nodeId),
    []
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        updateNodesPositions(nds.filter((n) => n.id !== nodeId))
      );
      if (editingNodeId === nodeId) setEditingNodeId(null);
    },
    [setNodes, editingNodeId, updateNodesPositions]
  );

  const handleAddNodeBelow = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const idx = nds.findIndex((n) => n.id === nodeId);
        if (idx === -1) return nds;

        const newNode: AgentNodeType = {
          id: generateNodeId(),
          type: "agentNode",
          position: { x: 0, y: 0 }, // position will be set by updateNodesPositions
          data: {
            stepNumber: 0,
            onEdit: () => {},
            onDelete: () => {},
            onAddBelow: () => {},
            onSave: () => {},
          },
          draggable: false,
        };

        const updatedNodes = [...nds];
        updatedNodes.splice(idx + 1, 0, newNode); // insert below
        return updateNodesPositions(updatedNodes);
      });
    },
    [setNodes, updateNodesPositions]
  );

  const handleSaveNode = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
      setNodes((nds) =>
        updateNodesPositions(
          nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
          )
        )
      );
      setEditingNodeId(null);
    },
    [updateNodesPositions]
  );

  const handleMoveNodeUp = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const idx = nds.findIndex((n) => n.id === nodeId);
        if (idx <= 0) return nds;
        const newNodes = [...nds];
        [newNodes[idx - 1], newNodes[idx]] = [newNodes[idx], newNodes[idx - 1]];
        return updateNodesPositions(newNodes);
      });
    },
    [updateNodesPositions]
  );

  const handleMoveNodeDown = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const idx = nds.findIndex((n) => n.id === nodeId);
        if (idx === -1 || idx >= nds.length - 1) return nds;
        const newNodes = [...nds];
        [newNodes[idx + 1], newNodes[idx]] = [newNodes[idx], newNodes[idx + 1]];
        return updateNodesPositions(newNodes);
      });
    },
    [updateNodesPositions]
  );

  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((node, index) => ({
        ...node,
        data: {
          ...node.data,
          nodeIndex: index,
          totalNodes: nodes.length,
          onEdit: handleEditNode,
          onDelete: handleDeleteNode,
          onAddBelow: handleAddNodeBelow,
          onMoveUp: handleMoveNodeUp,
          onMoveDown: handleMoveNodeDown,
          onSave: handleSaveNode,
          editingNodeId,
        },
      })),
    [
      nodes,
      handleEditNode,
      handleDeleteNode,
      handleAddNodeBelow,
      handleSaveNode,
      handleMoveNodeUp,
      handleMoveNodeDown,
      editingNodeId,
    ]
  );

  const nodeTypes: NodeTypes = useMemo(
    () => ({ agentNode: AgentNodeComponent }),
    []
  );

  const editingNode = editingNodeId
    ? nodes.find((n) => n.id === editingNodeId)
    : null;

  const computeTranslateExtent = useCallback(() => {
    const maxY =
      nodes.length > 0
        ? Math.max(...nodes.map((_, index) => 100 + index * VERTICAL_SPACING)) +
          PADDING_BELOW
        : MIN_CANVAS_HEIGHT;
    return [
      [-200, -100],
      [1200, Math.max(maxY, MIN_CANVAS_HEIGHT)],
    ] as [[number, number], [number, number]];
  }, [nodes]);

  useEffect(() => {
    const onResize = () => setNodes((nds) => updateNodesPositions(nds));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setNodes, updateNodesPositions]);

  return (
    <div className="h-screen flex flex-col">
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
          panOnDrag={false}
          zoomOnScroll={false}
          className="bg-gray-50"
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          onInit={(instance) => {
            rfInstanceRef.current = instance as unknown as ReactFlowInstance;
            setNodes((nds) => updateNodesPositions(nds));
          }}
        >
          <Background color="#FC7236" gap={20} size={1} />
        </ReactFlow>

        <div className="absolute top-4 left-4 z-10">
          <TitleNode title={agentTitle} onTitleChange={setAgentTitle} />
        </div>

        {editingNode && (
          <div className="absolute top-4 right-4 w-96 h-[calc(100vh-120px)] bg-white">
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
