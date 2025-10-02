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
  ephemeral?: boolean;
}

// Shape for partial updates
export type RequestPatch = Partial<
  Pick<Request, "prompt" | "q1" | "q2" | "q3" | "scheduledDate" | "status">
>;
