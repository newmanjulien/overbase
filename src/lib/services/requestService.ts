// src/lib/services/requestService.ts
"use client";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface PersistedRequest {
  id: string;
  status: "draft" | "submitted";
  createdAt?: any;
  updatedAt?: any;
  // flexible structure to match your steps
  [k: string]: any;
}

export async function getRequest(
  uid: string,
  requestId: string
): Promise<PersistedRequest | null> {
  const ref = doc(db, "users", uid, "requests", requestId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
}

export async function saveDraft(
  uid: string,
  requestId: string,
  data: Record<string, any>
) {
  const ref = doc(db, "users", uid, "requests", requestId);
  await setDoc(
    ref,
    {
      ...data,
      id: requestId,
      status: "draft",
      updatedAt: serverTimestamp(),
      // ❌ do not overwrite createdAt on every save
    },
    { merge: true }
  );
}

export async function submitRequest(
  uid: string,
  requestId: string,
  data: Record<string, any>
) {
  const ref = doc(db, "users", uid, "requests", requestId);
  await setDoc(
    ref,
    {
      ...data,
      id: requestId,
      status: "submitted",
      updatedAt: serverTimestamp(),
      // ❌ do not overwrite createdAt on every save
    },
    { merge: true }
  );
}
