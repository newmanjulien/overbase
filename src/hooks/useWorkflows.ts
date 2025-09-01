import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Step {
  title: string;
  prompt: string;
  conditions?: string;
  context?: string;
  integration?: string;
}

export interface Workflow {
  id: string;
  defaultTitle: string;
  steps: Step[];
}

// Real-time list of all workflows
export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "workflows"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workflow[];

      setWorkflows(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { workflows, loading };
}

// Real-time single workflow
export function useWorkflow(id: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "workflows", id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setWorkflow({ id: snapshot.id, ...snapshot.data() } as Workflow);
      } else {
        setWorkflow(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  return { workflow, loading };
}
