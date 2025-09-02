"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Handler {
  id: string;
  name: string;
  avatar?: string;
}

export function useHandlers() {
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHandlers = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "handlers"));
        const data: Handler[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Handler, "id">),
        }));
        setHandlers(data);
      } finally {
        setLoading(false);
      }
    };

    fetchHandlers();
  }, []);

  return { handlers, loading };
}
