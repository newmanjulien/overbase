import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

import { deserializeScheduledDate } from "@/lib/requestDates";

function timestampToISO(ts: Timestamp | null | undefined): string | null {
  return ts ? ts.toDate().toISOString() : null;
}

/**
 * Flat Request model (no step1/step2 nesting).
 */
export interface Request {
  id: string;
  prompt: string;
  scheduledDate: Date | null;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
  createdAt: string | null; // ISO string
  updatedAt: string | null; // ISO string
  submittedAt?: string | null;
}

/**
 * Raw Firestore shape before conversion.
 * scheduledDate is stored as a "yyyy-MM-dd" string.
 * createdAt/updatedAt/submittedAt are Firestore Timestamps.
 */
type FirestoreRequestData = {
  prompt?: string;
  scheduledDate?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  status?: "draft" | "active";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  submittedAt?: Timestamp;
};

export const requestConverter: FirestoreDataConverter<Request> = {
  toFirestore() {
    throw new Error(
      "Writes must go through requestService (services serialize on write)."
    );
  },

  fromFirestore(snap: QueryDocumentSnapshot): Request {
    const d = snap.data() as FirestoreRequestData;

    return {
      id: snap.id,
      prompt: d.prompt ?? "",
      // Read back from "yyyy-MM-dd" into a real Date (local midnight)
      scheduledDate: d.scheduledDate
        ? deserializeScheduledDate(d.scheduledDate)
        : null,
      q1: d.q1 ?? "",
      q2: d.q2 ?? "",
      q3: d.q3 ?? "",
      status: d.status === "active" ? "active" : "draft",
      createdAt: timestampToISO(d.createdAt),
      updatedAt: timestampToISO(d.updatedAt),
      submittedAt: timestampToISO(d.submittedAt),
    };
  },
};
