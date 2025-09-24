import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import {
  deserializeScheduledDate,
  serializeScheduledDate,
} from "@/lib/requestDates";

/**
 * Flat Request model (no step1/step2 nesting).
 * Matches what the app actually uses in UI & services.
 */
export interface Request {
  id: string;
  prompt: string;
  scheduledDate: Date | null;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "submitted";
  createdAt?: any; // Firestore Timestamp or null
  updatedAt?: any; // Firestore Timestamp or null
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
      createdAt: request.createdAt ?? null,
      updatedAt: request.updatedAt ?? null,
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
      createdAt: d.createdAt ?? null,
      updatedAt: d.updatedAt ?? null,
    };
  },
};
