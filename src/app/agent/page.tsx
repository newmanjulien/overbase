"use client";

import { ReactFlowProvider } from "@xyflow/react";
import AgentBuilder from "./Agent";

export default function Page() {
  return (
    <ReactFlowProvider>
      <AgentBuilder />
    </ReactFlowProvider>
  );
}
