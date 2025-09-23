import {
  Timestamp,
  serverTimestamp,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

export type Request = {
  id: string;
  prompt: string;
  scheduledDate: Date;
  q1?: string;
  q2?: string;
  q3?: string;
  status: "draft" | "submitted";
  createdAt?: Date;
  updatedAt?: Date;
};

export const requestConverter = {
  toFirestore(r: Omit<Request, "id" | "createdAt" | "updatedAt">) {
    return {
      ...r,
      scheduledDate: Timestamp.fromDate(r.scheduledDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(
    snap: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Request {
    const d = snap.data(options) as any;
    return {
      id: snap.id,
      prompt: d.prompt,
      scheduledDate: (d.scheduledDate as Timestamp).toDate(),
      q1: d.q1,
      q2: d.q2,
      q3: d.q3,
      status: d.status ?? "submitted",
      createdAt: d.createdAt?.toDate?.(),
      updatedAt: d.updatedAt?.toDate?.(),
    };
  },
};
