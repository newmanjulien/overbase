"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { requestReadConverterAdmin } from "@/lib/requests/model-Admin";
import type { Request } from "@/lib/requests/model-Types";
import { serializeScheduledDate, RepeatRule } from "@/lib/requests/Dates";
import { lexicalToPlainText } from "@/lib/lexical/utils";

//
// Helpers
//
function derivePromptFields(data: Partial<Request>) {
  const rich = data.promptRich ?? null;
  const plain = data.prompt ?? (rich ? lexicalToPlainText(rich) : "");
  return { prompt: plain, promptRich: rich };
}

function coalesceText(s: string | undefined | null): string {
  return s ?? "";
}

//
// Firestore write shapes
//
interface WriteRequest {
  id: string;
  prompt: string;
  promptRich?: unknown | null;
  scheduledDate: string | null;
  summary: string;
  summaryStatus: "idle" | "pending" | "ready" | "failed";
  status: "draft" | "active";
  createdAt: FieldValue;
  updatedAt: FieldValue;
  submittedAt: FieldValue | null;
  customer?: string;
  repeat?: RepeatRule | null;
}

interface WriteUpdate {
  prompt?: string;
  promptRich?: unknown | null;
  summary?: string;
  summaryStatus?: "idle" | "pending" | "ready" | "failed";
  scheduledDate?: string | null;
  status?: "draft" | "active";
  updatedAt?: FieldValue;
  submittedAt?: FieldValue | null;
  customer?: string;
  repeat?: RepeatRule | null;

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

/** Helper function to build the update object from partial request data */
function buildUpdateFromData(data: Partial<Request>): WriteUpdate {
  const update: WriteUpdate = {};

  if ("promptRich" in data || "prompt" in data) {
    const { prompt, promptRich } = derivePromptFields(data);
    update.prompt = prompt;
    update.promptRich = promptRich;
  }

  if (data.summary !== undefined) update.summary = coalesceText(data.summary);

  if (data.summaryStatus !== undefined)
    update.summaryStatus = data.summaryStatus;

  if (data.scheduledDate !== undefined) {
    update.scheduledDate = data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null;
  }

  if (data.customer !== undefined)
    update.customer = coalesceText(data.customer);

  if (data.repeat !== undefined) update.repeat = data.repeat ?? null;

  return update;
}

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
    promptRich: initialData.promptRich ?? null,
    scheduledDate: initialData.scheduledDate
      ? serializeScheduledDate(initialData.scheduledDate)
      : null,
    summary: "",
    summaryStatus: "idle",
    status: "draft",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    submittedAt: null,
    customer: initialData.customer ?? "",
    repeat: initialData.repeat ?? { type: "none" },
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
    ...buildUpdateFromData(data),
  };

  if ("promptRich" in data || "prompt" in data) {
    const { prompt, promptRich } = derivePromptFields(data);
    update.prompt = prompt;
    update.promptRich = promptRich;
  }

  if (data.summary !== undefined) update.summary = coalesceText(data.summary);

  if (data.summaryStatus !== undefined)
    update.summaryStatus = data.summaryStatus;

  if (data.scheduledDate !== undefined) {
    update.scheduledDate = data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null;
  }

  if (data.customer !== undefined)
    update.customer = coalesceText(data.customer);

  if (data.repeat !== undefined) update.repeat = data.repeat ?? null;

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
    ...buildUpdateFromData(data),
  };

  if ("promptRich" in data || "prompt" in data) {
    const { prompt, promptRich } = derivePromptFields(data);
    update.prompt = prompt;
    update.promptRich = promptRich;
  }

  if (data.summary !== undefined) update.summary = coalesceText(data.summary);

  if (data.summaryStatus !== undefined)
    update.summaryStatus = data.summaryStatus;

  if (data.scheduledDate !== undefined) {
    update.scheduledDate = data.scheduledDate
      ? serializeScheduledDate(data.scheduledDate)
      : null;
  }

  if (data.customer !== undefined)
    update.customer = coalesceText(data.customer);

  if (data.repeat !== undefined) update.repeat = data.repeat ?? null;

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
  summary: string
) {
  await adminDb.doc(`users/${uid}/requests/${requestId}`).update({
    summary,
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
) {
  await adminDb.doc(`users/${uid}/requests/${requestId}`).update({
    summaryStatus: "pending",
    summary: "",
    updatedAt: FieldValue.serverTimestamp(),
  });
}
