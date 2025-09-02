import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Agent {
  id: string;
  numericId?: number;
  title: string;
  description: string;
  skills: string[];
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  image?: string;
  assignedHandler?: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "agents"), (snapshot) => {
      const data: Agent[] = snapshot.docs.map((d) => {
        const raw = d.data() as Partial<Agent>; // Type-safe Firestore data

        const agent: Agent = {
          ...raw,
          id: d.id, // Firestore doc ID
          numericId: raw?.id ? Number(raw.id) : undefined, // convert string -> number
          skills: Array.isArray(raw?.skills) ? raw.skills : [],
          assignedHandler: raw?.assignedHandler || "",
          title: raw?.title || "Untitled", // default if missing
          description: raw?.description || "", // default if missing
        };

        return agent;
      });

      setAgents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { agents, loading };
}
