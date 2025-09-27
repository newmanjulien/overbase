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
import { db } from "@/lib/firebase";
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
  initialData: Partial<Request> = {}
): Promise<Request> {
  const id = crypto.randomUUID();

  // ❌ no converter on write
  const ref = doc(db, "users", uid, "requests", id);

  const draft: WriteRequest = {
    id,
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
  await updateDoc(ref, {
    prompt: data.prompt ?? "",
    q1: data.q1 ?? "",
    q2: data.q2 ?? "",
    q3: data.q3 ?? "",
    scheduledDate: data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null,
    status: "active",
    updatedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  });
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
  await updateDoc(ref, {
    prompt: data.prompt ?? "",
    q1: data.q1 ?? "",
    q2: data.q2 ?? "",
    q3: data.q3 ?? "",
    scheduledDate: data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Promote/demote
 */
export async function promoteToActive(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId);
  await updateDoc(ref, {
    status: "active",
    updatedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  });
}

export async function demoteToDraft(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId);
  await updateDoc(ref, {
    status: "draft",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete request
 */
export async function deleteRequest(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId);
  await deleteDoc(ref);
}
