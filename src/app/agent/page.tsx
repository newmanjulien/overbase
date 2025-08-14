"use client";

import { ReactFlowProvider } from "@xyflow/react";
import Agent from "./Agent";

export default function Page() {
  return (
    <ReactFlowProvider>
      <Agent />
    </ReactFlowProvider>
  );
}
