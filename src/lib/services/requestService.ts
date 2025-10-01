"use server";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  FieldValue,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Request, requestConverter } from "@/lib/models/request";
import { serializeScheduledDate } from "@/lib/requestDates";

interface WriteRequest {
  id: string;
  prompt: string;
  scheduledDate: string | null;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
  createdAt: FieldValue;
  updatedAt: FieldValue;
  submittedAt: FieldValue | null;
}

interface WriteUpdate {
  prompt?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  scheduledDate?: string | null;
  status?: "draft" | "active";
  updatedAt?: FieldValue;
  submittedAt?: FieldValue | null;

  [key: string]: unknown;
}

/**
 * Get a single request by ID.
 */
export async function getRequest(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId).withConverter(
    requestConverter
  );
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Create a new draft request.
 * Generates its own ID.
 */
export async function createDraft(
  uid: string,
  initialData: Partial<Request> = {},
  id?: string // ✅ NEW optional param
): Promise<Request> {
  const requestId = id ?? crypto.randomUUID();

  // ❌ no converter on write
  const ref = doc(db, "users", uid, "requests", requestId);

  const draft: WriteRequest = {
    id: requestId,
    prompt: initialData.prompt ?? "",
    scheduledDate: initialData.scheduledDate
      ? serializeScheduledDate(initialData.scheduledDate)
      : null,
    q1: "",
    q2: "",
    q3: "",
    status: "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    submittedAt: null,
  };

  await setDoc(ref, draft);

  // ✅ apply converter on readback
  const snap = await getDoc(ref.withConverter(requestConverter));
  return snap.data()!;
}

/**
 * Submit draft → active
 */
export async function submitDraft(
  uid: string,
  requestId: string,
  data: Partial<Request>
): Promise<void> {
  const ref = doc(db, "users", uid, "requests", requestId);

  const update: WriteUpdate = {
    status: "active",
    updatedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  };

  if (data.prompt !== undefined) update.prompt = data.prompt;
  if (data.q1 !== undefined) update.q1 = data.q1;
  if (data.q2 !== undefined) update.q2 = data.q2;
  if (data.q3 !== undefined) update.q3 = data.q3;
  if (data.scheduledDate !== undefined) {
    update.scheduledDate = data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null;
  }

  await updateDoc(ref, update);
}

/**
 * Update active request (no status change)
 */
export async function updateActive(
  uid: string,
  requestId: string,
  data: Partial<Request>
): Promise<void> {
  const ref = doc(db, "users", uid, "requests", requestId);

  const update: WriteUpdate = {
    updatedAt: serverTimestamp(),
  };

  if (data.prompt !== undefined) update.prompt = data.prompt;
  if (data.q1 !== undefined) update.q1 = data.q1;
  if (data.q2 !== undefined) update.q2 = data.q2;
  if (data.q3 !== undefined) update.q3 = data.q3;
  if (data.scheduledDate !== undefined) {
    update.scheduledDate = data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null;
  }

  await updateDoc(ref, update);
}

/**
 * Promote/demote
 */
export async function promoteToActive(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId);
  const update: WriteUpdate = {
    status: "active",
    updatedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  };
  await updateDoc(ref, update);
}

export async function demoteToDraft(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId);
  const update: WriteUpdate = {
    status: "draft",
    updatedAt: serverTimestamp(),
  };
  await updateDoc(ref, update);
}

/**
 * Delete request
 */
export async function deleteRequest(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId);
  await deleteDoc(ref);
}
