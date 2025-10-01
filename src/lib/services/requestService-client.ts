// Client side service

import { db } from "@/lib/firebase/firebase-client";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { requestReadConverterClient } from "@/lib/models/request-client";
import type {
  Request,
  RequestDoc,
  RequestPatch,
} from "@/lib/models/request-types";
import { format } from "date-fns";

// --- helpers ---
function serializeScheduledDate(d: Date | null): string | null {
  return d ? format(d, "yyyy-MM-dd") : null;
}
function coalesceText(s: string | undefined | null): string {
  return s ?? "";
}

// --- subscription ---
export function subscribeToRequestList(
  uid: string,
  onChange: (items: Request[]) => void
) {
  const col = collection(db, "users", uid, "requests").withConverter(
    requestReadConverterClient
  );
  const q = query(col, orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data()));
  });
}

// --- single read ---
export async function loadOne(
  uid: string,
  id: string
): Promise<Request | null> {
  const ref = doc(db, "users", uid, "requests", id).withConverter(
    requestReadConverterClient
  );
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// --- writes ---
export async function createDraft(
  uid: string,
  id: string,
  data: RequestPatch = {}
) {
  const ref = doc(db, "users", uid, "requests", id);
  const write: RequestDoc = {
    prompt: coalesceText(data.prompt),
    q1: coalesceText(data.q1),
    q2: coalesceText(data.q2),
    q3: coalesceText(data.q3),
    status: "draft",
    scheduledDate: serializeScheduledDate(data.scheduledDate ?? null),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, write, { merge: false });
}

export async function updateActive(
  uid: string,
  id: string,
  patch: RequestPatch
) {
  const ref = doc(db, "users", uid, "requests", id);
  const update: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if ("prompt" in patch) {
    update.prompt = coalesceText(patch.prompt);
  }
  if ("q1" in patch) {
    update.q1 = coalesceText(patch.q1);
  }
  if ("q2" in patch) {
    update.q2 = coalesceText(patch.q2);
  }
  if ("q3" in patch) {
    update.q3 = coalesceText(patch.q3);
  }
  if ("scheduledDate" in patch) {
    update.scheduledDate = serializeScheduledDate(patch.scheduledDate ?? null);
  }

  await updateDoc(ref, update);
}

export async function promoteToActive(uid: string, id: string) {
  await updateDoc(doc(db, "users", uid, "requests", id), {
    status: "active",
    updatedAt: serverTimestamp(),
  });
}

export async function demoteToDraft(uid: string, id: string) {
  await updateDoc(doc(db, "users", uid, "requests", id), {
    status: "draft",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRequest(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "requests", id));
}
