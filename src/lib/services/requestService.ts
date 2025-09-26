"use server";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Request, requestConverter } from "@/lib/models/request";

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
  const ref = doc(db, "users", uid, "requests", id).withConverter(
    requestConverter
  );

  const draft: Request = {
    id,
    prompt: initialData.prompt ?? "",
    scheduledDate: initialData.scheduledDate ?? null,
    q1: "",
    q2: "",
    q3: "",
    status: "draft",
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    submittedAt: null,
  };

  await setDoc(ref, draft);
  return draft;
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
    ...data,
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
    ...data,
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
