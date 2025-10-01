"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { Request, requestReadConverterAdmin } from "@/lib/models/request-admin";
import { serializeScheduledDate } from "@/lib/requestDates";

//
// Firestore write shapes
//
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

//
// ---- READ ----
//

/** Get a single request by ID */
export async function getRequest(uid: string, requestId: string) {
  const ref = adminDb
    .doc(`users/${uid}/requests/${requestId}`)
    .withConverter(requestReadConverterAdmin);

  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

//
// ---- WRITE ----
//

/** Create a new draft request */
export async function createDraft(
  uid: string,
  initialData: Partial<Request> = {},
  id?: string
): Promise<Request> {
  const requestId = id ?? crypto.randomUUID();

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
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    submittedAt: null,
  };

  // Write raw data
  await adminDb.doc(`users/${uid}/requests/${requestId}`).set(draft);

  // Read back with converter
  const snap = await adminDb
    .doc(`users/${uid}/requests/${requestId}`)
    .withConverter(requestReadConverterAdmin)
    .get();

  return snap.data()!;
}

/** Submit draft → active */
export async function submitDraft(
  uid: string,
  requestId: string,
  data: Partial<Request>
): Promise<void> {
  const ref = adminDb.doc(`users/${uid}/requests/${requestId}`);

  const update: WriteUpdate = {
    status: "active",
    updatedAt: FieldValue.serverTimestamp(),
    submittedAt: FieldValue.serverTimestamp(),
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

  await ref.update(update);
}

/** Update active request (no status change) */
export async function updateActive(
  uid: string,
  requestId: string,
  data: Partial<Request>
): Promise<void> {
  const ref = adminDb.doc(`users/${uid}/requests/${requestId}`);

  const update: WriteUpdate = {
    updatedAt: FieldValue.serverTimestamp(),
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

  await ref.update(update);
}

/** Promote active → active (explicit) */
export async function promoteToActive(uid: string, requestId: string) {
  const ref = adminDb.doc(`users/${uid}/requests/${requestId}`);

  const update: WriteUpdate = {
    status: "active",
    updatedAt: FieldValue.serverTimestamp(),
    submittedAt: FieldValue.serverTimestamp(),
  };

  await ref.update(update);
}

/** Demote active → draft */
export async function demoteToDraft(uid: string, requestId: string) {
  const ref = adminDb.doc(`users/${uid}/requests/${requestId}`);

  const update: WriteUpdate = {
    status: "draft",
    updatedAt: FieldValue.serverTimestamp(),
  };

  await ref.update(update);
}

/** Delete request */
export async function deleteRequest(uid: string, requestId: string) {
  await adminDb.doc(`users/${uid}/requests/${requestId}`).delete();
}
