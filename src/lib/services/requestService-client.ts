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
  FieldValue,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { requestReadConverterClient } from "@/lib/models/request-client";
import type { Request, RequestPatch } from "@/lib/models/request-types";
import { format } from "date-fns";

interface WriteRequestClient {
  prompt: string;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
  scheduledDate: string | null;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  submittedAt?: FieldValue;
  ephemeral?: boolean;
}

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
  const write: WriteRequestClient = {
    prompt: coalesceText(data.prompt),
    q1: coalesceText(data.q1),
    q2: coalesceText(data.q2),
    q3: coalesceText(data.q3),
    status: "draft",
    scheduledDate: serializeScheduledDate(data.scheduledDate ?? null),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ephemeral: true,
  };
  await setDoc(ref, write, { merge: false });
}

// --- ensure single draft ---
export async function ensureDraft(uid: string): Promise<string> {
  const col = collection(db, "users", uid, "requests");

  // Look for an existing draft
  const q = query(
    col,
    where("status", "==", "draft"),
    where("ephemeral", "==", true),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Reuse the first draft found
    return snap.docs[0].id;
  }

  // Otherwise create a new one
  const newRef = doc(col);
  const write: WriteRequestClient = {
    prompt: "",
    q1: "",
    q2: "",
    q3: "",
    status: "draft",
    scheduledDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ephemeral: true, // mark as system scratchpad
  };
  await setDoc(newRef, write, { merge: false });
  return newRef.id;
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
