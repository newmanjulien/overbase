"use client";

import { ReactFlowProvider } from "@xyflow/react";
import AgentBuilder from "./AgentBuilder";

export default function Page() {
  return (
    <ReactFlowProvider>
      <AgentBuilder />
    </ReactFlowProvider>
  );
}
