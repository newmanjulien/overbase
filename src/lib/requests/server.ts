"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { requestReadConverterServer } from "@/lib/requests/model-server";
import type { Request } from "@/lib/requests/model-Types";
import { serializeScheduledDate, RepeatRule } from "@/lib/requests/Dates";

function coalesceText(s: string | undefined | null): string {
  return s ?? "";
}

//
// Firestore write shapes
//

interface WriteUpdate {
  promptRich?: unknown | null;
  refineJson?: string;
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
    .withConverter(requestReadConverterServer);

  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

//
// ---- WRITE ----
//

/** Helper function to build the update object from partial request data */
function buildUpdateFromData(data: Partial<Request>): WriteUpdate {
  const update: WriteUpdate = {};

  if ("promptRich" in data) {
    update.promptRich = data.promptRich ?? null;
  }

  if (data.refineJson !== undefined) update.refineJson = coalesceText(data.refineJson);

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
