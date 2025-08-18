// import { useCallback } from "react";
// import type { AgentNodeType, NodeData } from "./Builder";

// export const useAgentNodeActions = (
//   nodes: AgentNodeType[],
//   setNodes: (nodes: AgentNodeType[]) => void,
//   getFlowCenterX: () => number,
//   setEditingNodeId: React.Dispatch<React.SetStateAction<string | null>>
// ) => {
//   const CARD_WIDTH = 352;
//   const VERTICAL_SPACING = 185;

//   const generateNodeId = () =>
//     `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//   const updateNodesPositions = useCallback(
//     (nodeList: AgentNodeType[]) => {
//       const flowCenterX = getFlowCenterX();

//       return nodeList.map((node, index) => ({
//         ...node,
//         position: {
//           x: flowCenterX - CARD_WIDTH / 2,
//           y: 100 + index * VERTICAL_SPACING,
//         },
//         style: { opacity: 1 },
//         data: { ...node.data, stepNumber: index + 1 },
//       }));
//     },
//     [getFlowCenterX]
//   );

//   const handleEditNode = useCallback(
//     (nodeId: string) => {
//       setEditingNodeId(nodeId);
//     },
//     [setEditingNodeId]
//   );

//   const handleDeleteNode = useCallback(
//     (nodeId: string) => {
//       setNodes(updateNodesPositions(nodes.filter((n) => n.id !== nodeId)));
//       setEditingNodeId((prev) => (prev === nodeId ? null : prev));
//     },
//     [nodes, setNodes, updateNodesPositions, setEditingNodeId]
//   );

//   const handleAddNodeBelow = useCallback(
//     (nodeId: string) => {
//       const idx = nodes.findIndex((n) => n.id === nodeId);
//       if (idx === -1) return;

//       const flowCenterX = getFlowCenterX();
//       const newY = 100 + (idx + 1) * VERTICAL_SPACING;

//       const newNode: AgentNodeType = {
//         id: generateNodeId(),
//         type: "agentNode",
//         position: { x: flowCenterX - CARD_WIDTH / 2, y: newY },
//         data: {
//           stepNumber: 0,
//           onEdit: () => {},
//           onDelete: () => {},
//           onAddBelow: () => {},
//           onSave: () => {},
//         },
//         draggable: false,
//       };

//       const updatedNodes = [...nodes];
//       updatedNodes.splice(idx + 1, 0, newNode);

//       setNodes(updateNodesPositions(updatedNodes));
//     },
//     [nodes, setNodes, updateNodesPositions, getFlowCenterX]
//   );

//   const handleSaveNode = useCallback(
//     (nodeId: string, data: Partial<NodeData>) => {
//       setNodes(
//         updateNodesPositions(
//           nodes.map((n) =>
//             n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
//           )
//         )
//       );
//       setEditingNodeId(null);
//     },
//     [nodes, setNodes, updateNodesPositions, setEditingNodeId]
//   );

//   const handleMoveNodeUp = useCallback(
//     (nodeId: string) => {
//       const idx = nodes.findIndex((n) => n.id === nodeId);
//       if (idx <= 0) return;
//       const newNodes = [...nodes];
//       [newNodes[idx - 1], newNodes[idx]] = [newNodes[idx], newNodes[idx - 1]];
//       setNodes(updateNodesPositions(newNodes));
//     },
//     [nodes, setNodes, updateNodesPositions]
//   );

//   const handleMoveNodeDown = useCallback(
//     (nodeId: string) => {
//       const idx = nodes.findIndex((n) => n.id === nodeId);
//       if (idx === -1 || idx >= nodes.length - 1) return;
//       const newNodes = [...nodes];
//       [newNodes[idx + 1], newNodes[idx]] = [newNodes[idx], newNodes[idx + 1]];
//       setNodes(updateNodesPositions(newNodes));
//     },
//     [nodes, setNodes, updateNodesPositions]
//   );

//   return {
//     handleEditNode,
//     handleDeleteNode,
//     handleAddNodeBelow,
//     handleSaveNode,
//     handleMoveNodeUp,
//     handleMoveNodeDown,
//     updateNodesPositions,
//   };
// };

import { useCallback } from "react";
import type { AgentNodeType, NodeData } from "./Builder";

export const useAgentNodeActions = (
  nodes: AgentNodeType[],
  setNodes: (nodes: AgentNodeType[]) => void,
  getFlowCenterX: () => number,
  setEditingNodeId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const CARD_WIDTH = 352;
  const VERTICAL_SPACING = 185;

  const generateNodeId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const updateNodesPositions = useCallback(
    (nodeList: AgentNodeType[]) => {
      const flowCenterX = getFlowCenterX();

      return nodeList.map((node, index) => ({
        ...node,
        position: {
          x: flowCenterX - CARD_WIDTH / 2,
          y: 100 + index * VERTICAL_SPACING,
        },
        style: { opacity: 1 },
        data: { ...node.data, stepNumber: index + 1 },
      }));
    },
    [getFlowCenterX]
  );

  const handleEditNode = useCallback(
    (nodeId: string) => {
      setEditingNodeId(nodeId);
    },
    [setEditingNodeId]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes(updateNodesPositions(nodes.filter((n) => n.id !== nodeId)));
      setEditingNodeId((prev) => (prev === nodeId ? null : prev));
    },
    [nodes, setNodes, updateNodesPositions, setEditingNodeId]
  );

  const handleAddNodeBelow = useCallback(
    (nodeId: string) => {
      const idx = nodes.findIndex((n) => n.id === nodeId);
      if (idx === -1) return;

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

      const updatedNodes = [...nodes];
      updatedNodes.splice(idx + 1, 0, newNode);

      setNodes(updateNodesPositions(updatedNodes));
    },
    [nodes, setNodes, updateNodesPositions, getFlowCenterX]
  );

  const handleSaveNode = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
      setNodes(
        updateNodesPositions(
          nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
          )
        )
      );
      setEditingNodeId(null);
    },
    [nodes, setNodes, updateNodesPositions, setEditingNodeId]
  );

  const handleMoveNodeUp = useCallback(
    (nodeId: string) => {
      const idx = nodes.findIndex((n) => n.id === nodeId);
      if (idx <= 0) return;
      const newNodes = [...nodes];
      [newNodes[idx - 1], newNodes[idx]] = [newNodes[idx], newNodes[idx - 1]];
      setNodes(updateNodesPositions(newNodes));
    },
    [nodes, setNodes, updateNodesPositions]
  );

  const handleMoveNodeDown = useCallback(
    (nodeId: string) => {
      const idx = nodes.findIndex((n) => n.id === nodeId);
      if (idx === -1 || idx >= nodes.length - 1) return;
      const newNodes = [...nodes];
      [newNodes[idx + 1], newNodes[idx]] = [newNodes[idx], newNodes[idx + 1]];
      setNodes(updateNodesPositions(newNodes));
    },
    [nodes, setNodes, updateNodesPositions]
  );

  return {
    handleEditNode,
    handleDeleteNode,
    handleAddNodeBelow,
    handleSaveNode,
    handleMoveNodeUp,
    handleMoveNodeDown,
    updateNodesPositions,
  };
};
