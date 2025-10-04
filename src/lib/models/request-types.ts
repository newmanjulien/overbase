export interface Request {
  id: string;
  prompt: string;
  promptRich?: unknown | null;
  scheduledDate: Date | null;
  summary: string;
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
    | "promptRich"
    | "summary"
    | "scheduledDate"
    | "status"
    | "customer"
    | "repeat"
  >
>;
