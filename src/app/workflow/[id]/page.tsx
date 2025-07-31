"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import WorkflowBuilder from "../../../workflow/Workflow";

export default function EditWorkflowPage() {
  const { id } = useParams();
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchWorkflow = async () => {
        try {
          const docRef = doc(db, "workflows", id as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setWorkflowData({
              id: docSnap.id,
              ...docSnap.data(),
            });
          }
        } catch (error) {
          console.error("Error fetching workflow:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchWorkflow();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!workflowData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Workflow not found</div>
      </div>
    );
  }

  return <WorkflowBuilder initialData={workflowData} />;
}
