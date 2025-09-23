import {
  Timestamp,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { format } from "date-fns";

export interface Request {
  id: string;
  prompt: string;
  scheduledDate: Date;
  q1?: string;
  q2?: string;
  q3?: string;
  status?: "draft" | "submitted";
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export const requestConverter = {
  toFirestore(r: Omit<Request, "id" | "createdAt" | "updatedAt">) {
    return {
      ...r,
      // Persist step1.scheduledDate as a string for Firestore
      step1: {
        ...r["step1"],
        scheduledDate: r.scheduledDate
          ? format(r.scheduledDate, "yyyy-MM-dd")
          : "",
        prompt: r.prompt,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  },
  fromFirestore(
    snap: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Request {
    const d = snap.data(options) as any;

    // Parse scheduledDate string into a Date at local midnight
    let parsedDate: Date = new Date();
    if (d.step1?.scheduledDate) {
      const [y, m, dnum] = d.step1.scheduledDate.split("-").map(Number);
      parsedDate = new Date(y, m - 1, dnum);
    }

    return {
      id: snap.id,
      prompt: d.step1?.prompt ?? "",
      scheduledDate: parsedDate,
      q1: d.step2?.q1 ?? "",
      q2: d.step2?.q2 ?? "",
      q3: d.step2?.q3 ?? "",
      status: d.status,
      createdAt:
        d.createdAt && typeof d.createdAt.toDate === "function"
          ? d.createdAt.toDate()
          : d.createdAt && d.createdAt.seconds
          ? new Date(
              d.createdAt.seconds * 1000 +
                Math.floor(d.createdAt.nanoseconds / 1e6)
            )
          : undefined,
      updatedAt:
        d.updatedAt && typeof d.updatedAt.toDate === "function"
          ? d.updatedAt.toDate()
          : d.updatedAt && d.updatedAt.seconds
          ? new Date(
              d.updatedAt.seconds * 1000 +
                Math.floor(d.updatedAt.nanoseconds / 1e6)
            )
          : undefined,
    };
  },
};
