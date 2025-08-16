"use client";

import { ReactFlowProvider } from "@xyflow/react";
import Builder from "./Builder";

export default function Page() {
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  );
}
