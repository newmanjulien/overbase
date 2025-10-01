//Client side service

import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-client";
import {
  Request,
  requestReadConverterClient,
} from "@/lib/models/request-client";

export function subscribeToRequestList(
  uid: string,
  onChange: (items: Request[]) => void
) {
  const col = collection(db, "users", uid, "requests").withConverter(
    requestReadConverterClient
  );
  const q = query(col, orderBy("updatedAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data()));
  });
  return unsub;
}
