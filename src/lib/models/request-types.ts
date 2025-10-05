export interface Request {
  id: string;
  prompt: string;
  scheduledDate: Date | null;
  summary: string;
  summarySourcePrompt?: string;
  summaryStatus?: "idle" | "pending" | "ready" | "failed";
  status: "draft" | "active";
  createdAt: Date | null;
  updatedAt: Date | null;
  submittedAt?: Date | null;
  ephemeral?: boolean;
  customer?: string;
  repeat?: string;
}

// Shape for partial updates
export type RequestPatch = Partial<
  Pick<
    Request,
    | "prompt"
    | "summary"
    | "summarySourcePrompt"
    | "summaryStatus"
    | "scheduledDate"
    | "status"
    | "customer"
    | "repeat"
  >
>;
