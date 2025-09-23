import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

export interface Request {
  id: string;
  prompt: string;
  scheduledDate: Date | null;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "submitted";
  createdAt?: any;
  updatedAt?: any;
}

export const requestConverter: FirestoreDataConverter<Request> = {
  toFirestore(request: Request) {
    let scheduledDate: string | null = null;

    if (request.scheduledDate instanceof Date) {
      // Format Date → string
      scheduledDate = `${request.scheduledDate.getFullYear()}-${String(
        request.scheduledDate.getMonth() + 1
      ).padStart(2, "0")}-${String(request.scheduledDate.getDate()).padStart(
        2,
        "0"
      )}`;
    } else if (typeof request.scheduledDate === "string") {
      // Already normalized
      scheduledDate = request.scheduledDate;
    }

    return {
      id: request.id,
      step1: {
        prompt: request.prompt,
        scheduledDate,
      },
      step2: {
        q1: request.q1,
        q2: request.q2,
        q3: request.q3,
      },
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

    let parsedDate: Date | null = null;
    if (typeof d.step1?.scheduledDate === "string") {
      const [y, m, dnum] = d.step1.scheduledDate.split("-").map(Number);
      if (y && m && dnum) {
        parsedDate = new Date(y, m - 1, dnum);
      }
    }

    return {
      id: snap.id,
      prompt: d.step1?.prompt ?? "",
      scheduledDate: parsedDate,
      q1: d.step2?.q1 ?? "",
      q2: d.step2?.q2 ?? "",
      q3: d.step2?.q3 ?? "",
      status: d.status ?? "draft",
      createdAt: d.createdAt ?? null,
      updatedAt: d.updatedAt ?? null,
    };
  },
};
