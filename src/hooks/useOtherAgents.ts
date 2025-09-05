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

export function useOtherAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "agents"), (snapshot) => {
      const data: Agent[] = snapshot.docs.map((d) => {
        const raw = d.data() as Partial<Agent>;
        return {
          ...raw,
          id: d.id,
          numericId: raw?.id ? Number(raw.id) : undefined,
          skills: Array.isArray(raw?.skills) ? raw.skills : [],
          assignedHandler: raw?.assignedHandler || "",
          title: raw?.title || "Untitled",
          description: raw?.description || "",
        };
      });

      // keep only non-installed
      setAgents(data.filter((a) => !a.skills?.includes("installed")));
    });

    return () => unsub();
  }, []);

  return { agents };
}
