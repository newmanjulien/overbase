//Client side service

import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-admin";
import { Request, requestConverter } from "@/lib/models/request";

export function subscribeToRequestList(
  uid: string,
  onChange: (items: Request[]) => void
) {
  const col = collection(db, "users", uid, "requests").withConverter(
    requestConverter
  );
  const q = query(col, orderBy("updatedAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data()));
  });
  return unsub;
}
