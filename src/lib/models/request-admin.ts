import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

import { deserializeScheduledDate } from "@/lib/requestDates";
import type { Request } from "@/lib/models/request-types";

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

export const requestReadConverterAdmin: FirestoreDataConverter<Request> = {
  toFirestore(): never {
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
      createdAt: d.createdAt ? d.createdAt.toDate() : null,
      updatedAt: d.updatedAt ? d.updatedAt.toDate() : null,
      submittedAt: d.submittedAt ? d.submittedAt.toDate() : null,
    };
  },
};
