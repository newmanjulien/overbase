"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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

import AgentNode from "./AgentNode";
import EditNode from "./EditNode";
import TitleNode from "./TitleNode";

import { dummySteps } from "./DummyData";

const CARD_WIDTH = 352; // fixed width (w-88 in Tailwind)
const VERTICAL_SPACING = 205;
const PADDING_BELOW = 350;
const MIN_CANVAS_HEIGHT = 800;

const nodeTypes: NodeTypes = { agentNode: AgentNode };

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

  const createInitialNodes = useCallback((): AgentNodeType[] => {
    return dummySteps.map((step, index) => ({
      id: `${Date.now()}-${index}`,
      type: "agentNode",
      position: { x: 0, y: 0 },
      data: {
        stepNumber: index + 1,
        title: step.title,
        prompt: step.prompt,
        context: step.context,
        onEdit: () => {},
        onDelete: () => {},
        onAddBelow: () => {},
        onSave: () => {},
      },
      draggable: false,
    }));
  }, []);

  const initialNodes = useMemo(
    () => createInitialNodes(),
    [createInitialNodes]
  );
  const [nodes, setNodes, onNodesChange] =
    useNodesState<AgentNodeType>(initialNodes);

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
    () => buildSequentialEdges(nodes),
    [nodes, buildSequentialEdges]
  );

  const getFlowCenterX = useCallback(() => {
    const rf = rfInstanceRef.current;
    const wrapper = flowWrapperRef.current;
    if (!rf || !wrapper) return 0;
    const { x: tx, zoom } = rf.getViewport();
    const containerWidth = wrapper.clientWidth || 1200;
    return (containerWidth / 2 - tx) / zoom;
  }, []);

  const getNodeWidth = useCallback(() => CARD_WIDTH, []);

  const updateNodesPositions = useCallback(
    (nodeList: AgentNodeType[]) => {
      const flowCenterX = getFlowCenterX();

      return nodeList.map((node, index) => ({
        ...node,
        position: {
          x: flowCenterX - CARD_WIDTH / 2,
          y: 100 + index * VERTICAL_SPACING,
        },
        data: { ...node.data, stepNumber: index + 1 },
      }));
    },
    [getFlowCenterX]
  );

  const handleEditNode = useCallback(
    (nodeId: string) => setEditingNodeId(nodeId),
    []
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) =>
        updateNodesPositions(currentNodes.filter((n) => n.id !== nodeId))
      );
      if (editingNodeId === nodeId) setEditingNodeId(null);
    },
    [setNodes, editingNodeId, updateNodesPositions]
  );

  const handleAddNodeBelow = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => {
        const idx = currentNodes.findIndex((n) => n.id === nodeId);
        if (idx === -1) return currentNodes;

        const flowCenterX = getFlowCenterX();
        const newY = 100 + (idx + 1) * VERTICAL_SPACING;

        const newNode: AgentNodeType = {
          id: generateNodeId(),
          type: "agentNode",
          position: { x: flowCenterX - CARD_WIDTH / 2, y: newY },
          data: {
            stepNumber: 0,
            onEdit: () => {},
            onDelete: () => {},
            onAddBelow: () => {},
            onSave: () => {},
          },
          draggable: false,
        };

        const updatedNodes = [...currentNodes];
        updatedNodes.splice(idx + 1, 0, newNode);

        return updateNodesPositions(updatedNodes);
      });
    },
    [setNodes, updateNodesPositions, getFlowCenterX]
  );

  const onAddBetween = useCallback(
    (edgeId: string) => {
      const match = edgeId.match(/^e-(.+)-(.+)$/);
      if (!match) return;
      const [, sourceId] = match;
      handleAddNodeBelow(sourceId);
    },
    [handleAddNodeBelow]
  );

  const handleSaveNode = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
      setNodes((currentNodes) =>
        updateNodesPositions(
          currentNodes.map((n) =>
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
      setNodes((currentNodes) => {
        const idx = currentNodes.findIndex((n) => n.id === nodeId);
        if (idx <= 0) return currentNodes;
        const newNodes = [...currentNodes];
        [newNodes[idx - 1], newNodes[idx]] = [newNodes[idx], newNodes[idx - 1]];
        return updateNodesPositions(newNodes);
      });
    },
    [updateNodesPositions]
  );

  const handleMoveNodeDown = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => {
        const idx = currentNodes.findIndex((n) => n.id === nodeId);
        if (idx === -1 || idx >= currentNodes.length - 1) return currentNodes;
        const newNodes = [...currentNodes];
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

  const editingNode = nodes.find((n) => n.id === editingNodeId) ?? null;

  const computeTranslateExtent = useCallback(() => {
    const maxY =
      nodes.length > 0
        ? Math.max(...nodes.map((_, index) => 100 + index * VERTICAL_SPACING)) +
          PADDING_BELOW +
          (nodes.length > 0 ? 60 : 0)
        : MIN_CANVAS_HEIGHT;
    return [
      [-200, -100],
      [1200, Math.max(maxY, MIN_CANVAS_HEIGHT)],
    ] as [[number, number], [number, number]];
  }, [nodes]);

  useEffect(() => {
    const handleResize = () =>
      setNodes((currentNodes) => updateNodesPositions(currentNodes));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setNodes, updateNodesPositions]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep" as const,
      style: { stroke: "#E5E7EB" },
    }),
    []
  );

  return (
    <div className="h-screen flex flex-col">
      <div ref={flowWrapperRef} className="flex-1 relative">
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
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
          defaultEdgeOptions={defaultEdgeOptions}
          onInit={(instance) => {
            rfInstanceRef.current = instance as unknown as ReactFlowInstance;
            setNodes((currentNodes) => updateNodesPositions(currentNodes));
          }}
        >
          <Background color="#Fafafafa" gap={20} size={1} />
        </ReactFlow>

        <div className="absolute top-4 left-4 z-10">
          <TitleNode title={agentTitle} onTitleChange={setAgentTitle} />
        </div>

        {editingNode && (
          <div className="absolute top-4 right-4 w-96 h-[calc(100vh-120px)] bg-white">
            <EditNode
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
