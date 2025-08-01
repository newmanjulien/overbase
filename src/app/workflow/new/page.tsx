import { Suspense } from "react";
import NewWorkflowPageInner from "./NewWorkflowPageInner";

export default function NewWorkflowPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Loading...</div>}>
      <NewWorkflowPageInner />
    </Suspense>
  );
}
