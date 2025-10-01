export interface Request {
  id: string;
  prompt: string;
  scheduledDate: Date | null;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
  createdAt: string | null;
  updatedAt: string | null;
  submittedAt?: string | null;
}
