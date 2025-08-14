"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import { Save } from "lucide-react";

import CustomEdge from "./CustomEdge";
import AgentCard, { CARD_TYPES } from "./AgentCard";
import EditAgentModal from "../agent/EditAgentModal";

const CARD_WIDTH = 320;
const VERTICAL_SPACING = 200;
const CANVAS_CENTER_X = 400;

const nodeTypes = { agentCard: AgentCard };

const edgeTypes = { custom: CustomEdge };

function AgentBuilder() {
  const [agentTitle, setAgentTitle] = useState("AI Agents");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "webhook" as keyof typeof CARD_TYPES,
  });

  const updateNodesOrder = useCallback((nodesList: Node[]) => {
    const sorted = [...nodesList].sort((a, b) => a.position.y - b.position.y);
    return sorted.map((node, i) => ({
      ...node,
      position: {
        x: CANVAS_CENTER_X - CARD_WIDTH / 2,
        y: 100 + i * VERTICAL_SPACING,
      },
      data: { ...node.data, stepNumber: i + 1 },
    }));
  }, []);

  const handleEditCard = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setEditingNode(node);
        setEditForm({
          title: node.data.title || "",
          description: node.data.description || "",
          type: node.data.type || "webhook",
        });
        setIsEditModalOpen(true);
      }
    },
    [nodes]
  );

  const handleDeleteCard = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        if (nds.length <= 1) return nds;
        return updateNodesOrder(nds.filter((n) => n.id !== nodeId));
      });
    },
    [setNodes, updateNodesOrder]
  );

  const handleAddCardBelow = useCallback(
    (nodeId: string) => {
      const newId = nodeIdCounter.toString();
      setNodes((nds) => {
        const idx = nds.findIndex((n) => n.id === nodeId);
        if (idx === -1) return nds;

        const newNode: Node = {
          id: newId,
          type: "agentCard",
          position: { x: 0, y: 0 },
          data: {
            id: newId,
            stepNumber: 1,
            title: "New Step",
            description: "Click to configure...",
            type: "webhook",
            onEdit: handleEditCard,
            onDelete: handleDeleteCard,
            onAddBelow: handleAddCardBelow,
          },
        };

        const next = [...nds];
        next.splice(idx + 1, 0, newNode);
        return updateNodesOrder(next);
      });
      setNodeIdCounter((c) => c + 1);
    },
    [
      nodeIdCounter,
      setNodes,
      updateNodesOrder,
      handleEditCard,
      handleDeleteCard,
    ]
  );

  const handleAddCardBetween = useCallback(
    (edgeId: string) => {
      const newId = nodeIdCounter.toString();
      setNodes((nds) => {
        const newNode: Node = {
          id: newId,
          type: "agentCard",
          position: { x: 0, y: 0 },
          data: {
            id: newId,
            stepNumber: 1,
            title: "New Step",
            description: "Click to configure...",
            type: "webhook",
            onEdit: handleEditCard,
            onDelete: handleDeleteCard,
            onAddBelow: handleAddCardBelow,
          },
        };
        const next = [...nds, newNode];
        return updateNodesOrder(next);
      });
      setNodeIdCounter((c) => c + 1);
    },
    [
      nodeIdCounter,
      setNodes,
      updateNodesOrder,
      handleEditCard,
      handleDeleteCard,
    ]
  );

  const handleSave = useCallback(() => {
    console.log("Save agent:", { title: agentTitle, nodes, edges });
  }, [agentTitle, nodes, edges]);

  useEffect(() => {
    if (isInitialized || nodes.length) return;

    const initial = [
      {
        id: "1",
        type: "agentCard",
        position: { x: 0, y: 0 },
        data: {
          id: "1",
          stepNumber: 1,
          title: "Catch Hook",
          description: "",
          type: "webhook",
          onEdit: handleEditCard,
          onDelete: handleDeleteCard,
          onAddBelow: handleAddCardBelow,
        },
      },
      {
        id: "2",
        type: "agentCard",
        position: { x: 0, y: 0 },
        data: {
          id: "2",
          stepNumber: 2,
          title: "Find Person",
          description: "",
          type: "clearbit",
          onEdit: handleEditCard,
          onDelete: handleDeleteCard,
          onAddBelow: handleAddCardBelow,
        },
      },
      {
        id: "3",
        type: "agentCard",
        position: { x: 0, y: 0 },
        data: {
          id: "3",
          stepNumber: 3,
          title: "Split into paths",
          description: "",
          type: "paths",
          onEdit: handleEditCard,
          onDelete: handleDeleteCard,
          onAddBelow: handleAddCardBelow,
        },
      },
    ];

    setNodes(updateNodesOrder(initial));
    setNodeIdCounter(4);
    setIsInitialized(true);
  }, [
    isInitialized,
    nodes,
    handleEditCard,
    handleDeleteCard,
    handleAddCardBelow,
    updateNodesOrder,
    setNodes,
  ]);

  useEffect(() => {
    if (!nodes.length) return;

    const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const newEdges: Edge[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const source = sorted[i].id;
      const target = sorted[i + 1].id;
      newEdges.push({
        id: `${source}-${target}`,
        source,
        target,
        type: "custom",
        data: { onAddBetween: handleAddCardBetween },
      });
    }
    setEdges(newEdges);
  }, [nodes, handleAddCardBetween, setEdges]);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <Input
          value={agentTitle}
          onChange={(e) => setAgentTitle(e.target.value)}
          className="text-xl font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
          placeholder="Agent Title"
        />
        <Button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </Button>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(event, node) => {
            console.log("Card clicked:", node.id); // debug
            handleEditCard(node.id); // open modal
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3, minZoom: 0.5, maxZoom: 1.5 }}
          minZoom={0.3}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          translateExtent={[
            [-200, -100],
            [1000, 2000],
          ]}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <EditAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={editForm}
        setFormData={setEditForm}
      />
    </div>
  );
}

export default AgentBuilder;
