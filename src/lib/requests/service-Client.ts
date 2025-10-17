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
import { requestReadConverterClient } from "@/lib/requests/model-Client";
import type { Request, RequestPatch } from "@/lib/requests/model-Types";
import { format } from "date-fns";
import { RepeatRule } from "@/lib/requests/Dates";

interface WriteRequestClient {
  promptRich?: unknown | null;
  refineJson: string;
  status: "draft" | "active";
  scheduledDate: string | null;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  submittedAt?: FieldValue;
  ephemeral?: boolean;
  customer?: string;
  repeat?: RepeatRule | null;
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
    promptRich: null,
    refineJson: "",
    status: "draft",
    scheduledDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ephemeral: true,
    customer: "",
    repeat: { type: "none" },
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

  if ("promptRich" in patch) {
    update.promptRich = patch.promptRich ?? null;
    update.ephemeral = false;
  }

  if ("refineJson" in patch) {
    update.refineJson = coalesceText(patch.refineJson);
    update.ephemeral = false;
  }

  if ("scheduledDate" in patch) {
    update.scheduledDate = serializeScheduledDate(patch.scheduledDate ?? null);
  }

  if ("customer" in patch) {
    update.customer = coalesceText(patch.customer);
    update.ephemeral = false;
  }

  if (patch.repeat !== undefined) {
    update.repeat = patch.repeat ?? { type: "none" };
    update.ephemeral = false;
  }

  await updateDoc(ref, update);
}

export async function promoteToActive(uid: string, id: string) {
  await updateDoc(doc(db, "users", uid, "requests", id), {
    status: "active",
    updatedAt: serverTimestamp(),
    ephemeral: false,
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
