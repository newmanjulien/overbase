import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Agent {
  id: string; // Firestore doc ID is always string
  title: string;
  description: string;
  skills: string[];
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  image?: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "agents"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Agent[];

      setAgents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { agents, loading };
}
