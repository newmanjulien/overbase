"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { requestReadConverterAdmin } from "@/lib/models/request-admin";
import type { Request } from "@/lib/models/request-types";
import { serializeScheduledDate } from "@/lib/requestDates";

//
// Firestore write shapes
//
interface WriteRequest {
  id: string;
  prompt: string;
  scheduledDate: string | null;
  summary: string;
  summarySourcePrompt?: string;
  summaryStatus: "idle" | "pending" | "ready" | "failed";
  status: "draft" | "active";
  createdAt: FieldValue;
  updatedAt: FieldValue;
  submittedAt: FieldValue | null;
  customer?: string;
  repeat?: string;
}

interface WriteUpdate {
  prompt?: string;
  summary?: string;
  summarySourcePrompt?: string;
  summaryStatus?: "idle" | "pending" | "ready" | "failed";
  scheduledDate?: string | null;
  status?: "draft" | "active";
  updatedAt?: FieldValue;
  submittedAt?: FieldValue | null;
  customer?: string;
  repeat?: string;
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
    summary: "",
    summarySourcePrompt: "",
    summaryStatus: "idle",
    status: "draft",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    submittedAt: null,
    customer: initialData.customer ?? "",
    repeat: initialData.repeat ?? "Does not repeat",
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
  if (data.summary !== undefined) update.summary = data.summary;
  if (data.summarySourcePrompt !== undefined)
    update.summarySourcePrompt = data.summarySourcePrompt;
  if (data.summaryStatus !== undefined)
    update.summaryStatus = data.summaryStatus;
  if (data.scheduledDate !== undefined) {
    update.scheduledDate = data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null;
  }
  if (data.customer !== undefined) update.customer = data.customer;
  if (data.repeat !== undefined) update.repeat = data.repeat;

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
  if (data.summary !== undefined) update.summary = data.summary;
  if (data.summarySourcePrompt !== undefined)
    update.summarySourcePrompt = data.summarySourcePrompt;
  if (data.summaryStatus !== undefined)
    update.summaryStatus = data.summaryStatus;
  if (data.scheduledDate !== undefined) {
    update.scheduledDate = data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null;
  }
  if (data.customer !== undefined) update.customer = data.customer;
  if (data.repeat !== undefined) update.repeat = data.repeat;

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

export async function markSummarySuccess(
  uid: string,
  requestId: string,
  summary: string,
  prompt: string
) {
  await adminDb.doc(`users/${uid}/requests/${requestId}`).update({
    summary,
    summarySourcePrompt: prompt,
    summaryStatus: "ready",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markSummaryFailure(uid: string, requestId: string) {
  await adminDb.doc(`users/${uid}/requests/${requestId}`).update({
    summaryStatus: "failed",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markSummaryPending(
  uid: string,
  requestId: string,
  prompt: string
) {
  await adminDb.doc(`users/${uid}/requests/${requestId}`).update({
    summaryStatus: "pending",
    summary: "",
    summarySourcePrompt: prompt,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
