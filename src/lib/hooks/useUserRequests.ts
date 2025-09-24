import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Request, requestConverter } from "@/lib/models/request";
import { useAuth } from "@/lib/auth";
import { toDateKey } from "@/lib/requestDates";

/**
 * Reads the current user's requests from:
 *   /users/{uid}/requests
 * And builds a byDate map using centralized date keys.
 */
export function useUserRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      return;
    }

    const ref = collection(db, "users", user.uid, "requests").withConverter(
      requestConverter
    );

    const unsub = onSnapshot(ref, (snap) => {
      const rows: Request[] = [];
      snap.forEach((doc) => {
        const data = doc.data(); // already converted to Request
        rows.push(data);
      });
      setRequests(rows);
    });

    return () => unsub();
  }, [user]);

  // Build map of requests by "yyyy-MM-dd"
  const byDate = useMemo(() => {
    const map: Record<string, Request[]> = {};
    for (const r of requests) {
      if (!r.scheduledDate || isNaN(r.scheduledDate.getTime())) continue;
      const key = toDateKey(r.scheduledDate);
      (map[key] ??= []).push(r);
    }
    return map;
  }, [requests]);

  return { requests, byDate };
}
