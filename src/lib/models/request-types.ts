export interface Request {
  id: string;
  prompt: string;
  scheduledDate: Date | null;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
  createdAt: Date | null;
  updatedAt: Date | null;
  submittedAt?: Date | null;
}

// Shape stored in Firestore
export interface RequestDoc {
  prompt: string;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
  scheduledDate: string | null; // stored as "yyyy-MM-dd"
  createdAt: any; // Firestore serverTimestamp() | Timestamp
  updatedAt: any; // Firestore serverTimestamp() | Timestamp
  submittedAt?: any;
}

// Shape for partial updates
export type RequestPatch = Partial<
  Pick<Request, "prompt" | "q1" | "q2" | "q3" | "scheduledDate" | "status">
>;
