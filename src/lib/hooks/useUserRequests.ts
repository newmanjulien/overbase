"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { requestConverter, Request } from "../models/request";
import { format } from "date-fns";

export function useUserRequests(uid: string) {
  const [requests, setRequests] = useState<Request[]>([]);
  const loading = !uid;

  useEffect(() => {
    if (!uid) return;

    const col = collection(db, "users", uid, "requests").withConverter(
      requestConverter
    );

    // ❌ Removed orderBy("scheduledDate") – not a top-level Timestamp
    const unsub = onSnapshot(col, (snap) => {
      let data: Request[] = snap.docs.map(
        (d: QueryDocumentSnapshot<DocumentData>) => d.data() as Request
      );

      // ✅ Only keep submitted
      data = data.filter((r) => r.status === "submitted");

      // ✅ Sort in memory by scheduledDate (asc)
      data.sort(
        (a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()
      );

      setRequests(data);
    });

    return () => unsub();
  }, [uid]);

  const byDate = useMemo(() => {
    const map: Record<string, Request[]> = {};
    for (const r of requests) {
      const key = format(r.scheduledDate, "yyyy-MM-dd"); // local day key
      (map[key] ||= []).push(r);
    }
    return map;
  }, [requests]);

  return { requests, byDate, loading };
}
