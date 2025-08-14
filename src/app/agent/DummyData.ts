// /src/app/agent/DummyData.ts

import { Node, Edge } from "@xyflow/react";
import { CARD_TYPES } from "./AgentCard";

/* ------------------------------------------------------------------ */
/* 1.  Initial nodes                                                  */
/* ------------------------------------------------------------------ */
export const initialNodes: Node[] = [
  {
    id: "1",
    type: "agentCard",
    position: { x: 0, y: 0 },
    data: {
      id: "1",
      stepNumber: 1,
      title: "Catch Hook",
      description: "Receives incoming webhook data",
      type: "webhook",
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
      description: "Look up user info using Clearbit",
      type: "clearbit",
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
      description: "Decide next step based on conditions",
      type: "paths",
    },
  },
];

/* ------------------------------------------------------------------ */
/* 2.  Initial edges (optional)                                       */
/* ------------------------------------------------------------------ */
export const initialEdges: Edge[] = [
  { id: "1-2", source: "1", target: "2", type: "custom" },
  { id: "2-3", source: "2", target: "3", type: "custom" },
];

/* ------------------------------------------------------------------ */
/* 3.  Card templates (optional)                                      */
/* ------------------------------------------------------------------ */
export const cardTemplates = [
  {
    id: "webhook",
    title: "Webhooks by Zapier",
    description: "Trigger actions from webhooks",
    type: "webhook" as const,
  },
  {
    id: "clearbit",
    title: "Clearbit Lookup",
    description: "Fetch user/company info",
    type: "clearbit" as const,
  },
  {
    id: "paths",
    title: "Paths Step",
    description: "Create multiple decision paths",
    type: "paths" as const,
  },
];
