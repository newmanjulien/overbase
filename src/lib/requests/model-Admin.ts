import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { deserializeScheduledDate, RepeatRule } from "@/lib/requests/Dates";
import type { Request } from "@/lib/requests/model-Types";
import { lexicalToPlainText } from "@/lib/lexical/utils";

/**
 * Raw Firestore shape before conversion.
 * scheduledDate is stored as a "yyyy-MM-dd" string.
 * createdAt/updatedAt/submittedAt are Firestore Timestamps.
 */
type FirestoreRequestData = {
  prompt?: string;
  promptRich?: unknown | null;
  scheduledDate?: string;
  refineJson?: string;
  status?: "draft" | "active";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  submittedAt?: Timestamp;
  ephemeral?: boolean;
  customer?: string;
  repeat?: RepeatRule | null;
};

export const requestReadConverterAdmin: FirestoreDataConverter<Request> = {
  toFirestore(): never {
    throw new Error(
      "Writes must go through requestService (services serialize on write)."
    );
  },

  fromFirestore(snap: QueryDocumentSnapshot): Request {
    const d = snap.data() as FirestoreRequestData;

    const promptRich =
      d.promptRich &&
      typeof d.promptRich === "object" &&
      "root" in d.promptRich
        ? (d.promptRich as SerializedEditorState<SerializedLexicalNode>)
        : null;

    return {
      id: snap.id,
      prompt: lexicalToPlainText(promptRich),
      promptRich,
      // Read back from "yyyy-MM-dd" into a real Date (local midnight)
      scheduledDate: d.scheduledDate
        ? deserializeScheduledDate(d.scheduledDate)
        : null,
      refineJson: d.refineJson ?? "",
      status: d.status === "active" ? "active" : "draft",
      createdAt: d.createdAt ? d.createdAt.toDate() : null,
      updatedAt: d.updatedAt ? d.updatedAt.toDate() : null,
      submittedAt: d.submittedAt ? d.submittedAt.toDate() : null,
      ephemeral: d.ephemeral ?? false,
      customer: d.customer ?? "",
      repeat: d.repeat ?? { type: "none" },
    };
  },
};
