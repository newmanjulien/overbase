import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Agent } from "./useInstalledAgents";

/**
 * Fetch all non-installed agents in real-time, after installed agents have loaded.
 * Filters out installed agents client-side to avoid Firestore 'not-in' limit.
 */
export function useOtherAgents(installedLoaded: boolean) {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (!installedLoaded) return; // Wait until installed agents are loaded

    const unsubscribe = onSnapshot(collection(db, "agents"), (snapshot) => {
      const data: Agent[] = snapshot.docs
        .map((d) => {
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
        })
        .filter((agent) => !agent.skills.includes("installed")); // filter client-side

      setAgents(data);
    });

    return () => unsubscribe();
  }, [installedLoaded]);

  return { agents };
}
