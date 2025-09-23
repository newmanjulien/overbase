import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Request, requestConverter } from "@/lib/models/request";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

export function useUserRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "requests").withConverter(
        requestConverter
      ),
      where("status", "==", "submitted")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((doc) => doc.data() as Request);
      setRequests(arr);
    });

    return () => unsub();
  }, [user]);

  // Build map of requests by date string
  const byDate = useMemo(() => {
    const map: Record<string, Request[]> = {};
    requests.forEach((r) => {
      if (!r.scheduledDate || isNaN(r.scheduledDate.getTime())) return; // ✅ skip invalid
      const key = format(r.scheduledDate, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [requests]);

  return { requests, byDate };
}
