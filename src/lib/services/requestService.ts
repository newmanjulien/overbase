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
  requestId: string
): Promise<PersistedRequest | null> {
  const ref = doc(db, "requests", requestId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
}

export async function saveDraft(requestId: string, data: Record<string, any>) {
  const ref = doc(db, "requests", requestId);
  await setDoc(
    ref,
    {
      ...data,
      id: requestId,
      status: "draft",
      updatedAt: serverTimestamp(),
      createdAt: data.createdAt ?? serverTimestamp(),
    },
    { merge: true }
  );
}

export async function submitRequest(
  requestId: string,
  data: Record<string, any>
) {
  const ref = doc(db, "requests", requestId);
  await setDoc(
    ref,
    {
      ...data,
      id: requestId,
      status: "submitted",
      updatedAt: serverTimestamp(),
      createdAt: data.createdAt ?? serverTimestamp(),
    },
    { merge: true }
  );
}
