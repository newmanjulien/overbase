"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { requestConverter, Request } from "../models/request";
import { format } from "date-fns";

export function useUserRequests(uid: string | null) {
  const [requests, setRequests] = useState<Request[]>([]);
  const loading = uid == null;

  useEffect(() => {
    if (!uid) return;

    const col = collection(db, "users", uid, "requests").withConverter(
      requestConverter
    );
    const q = query(col, orderBy("scheduledDate", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const data: Request[] = snap.docs.map(
        (d: QueryDocumentSnapshot<DocumentData>) => d.data() as Request // explicitly cast here
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
