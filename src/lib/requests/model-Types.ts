import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { type RepeatRule } from "@/lib/requests/Dates";

export interface Request {
  id: string;
  prompt: string;
  promptRich: SerializedEditorState<SerializedLexicalNode> | null;
  scheduledDate: Date | null;
  refineJson: string;
  status: "draft" | "active";
  createdAt: Date | null;
  updatedAt: Date | null;
  submittedAt?: Date | null;
  ephemeral?: boolean;
  customer?: string;
  repeat?: RepeatRule | null;
}

// Shape for partial updates
export type RequestPatch = Partial<
  Pick<
    Request,
    | "prompt"
    | "promptRich"
    | "refineJson"
    | "scheduledDate"
    | "status"
    | "customer"
    | "repeat"
  >
>;
