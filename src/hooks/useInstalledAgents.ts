import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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

export function useInstalledAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "agents"),
      where("skills", "array-contains", "installed")
    );

    const unsub = onSnapshot(q, (snapshot) => {
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
      setAgents(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { agents, loading };
}
