import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import {
  deserializeScheduledDate,
  serializeScheduledDate,
} from "@/lib/requestDates";

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

export const requestConverter: FirestoreDataConverter<Request> = {
  toFirestore(request: Request) {
    return {
      id: request.id,
      prompt: request.prompt,
      // Store as "yyyy-MM-dd" string (stable, time-zone-safe for calendar)
      scheduledDate: request.scheduledDate
        ? serializeScheduledDate(request.scheduledDate)
        : null,
      q1: request.q1,
      q2: request.q2,
      q3: request.q3,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      submittedAt: request.submittedAt ?? null,
    };
  },

  fromFirestore(
    snap: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Request {
    const d = snap.data(options) as any;

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
      status: d.status ?? "draft",
      createdAt: timestampToISO(d.createdAt),
      updatedAt: timestampToISO(d.updatedAt),
      submittedAt: timestampToISO(d.submittedAt),
    };
  },
};
