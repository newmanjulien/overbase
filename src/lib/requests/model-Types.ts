import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

export interface Request {
  id: string;
  prompt: string;
  promptRich: SerializedEditorState<SerializedLexicalNode> | null;
  scheduledDate: Date | null;
  summary: string;
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
    | "promptRich"
    | "summary"
    | "summaryStatus"
    | "scheduledDate"
    | "status"
    | "customer"
    | "repeat"
  >
>;
