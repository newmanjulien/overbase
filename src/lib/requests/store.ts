"use client";

import { create } from "zustand";
import type { Request } from "@/lib/requests/model-Types";
import {
  subscribeToRequestList,
  loadOne,
  createDraft,
  updateActive,
  promoteToActive,
  demoteToDraft,
  deleteRequest,
  ensureDraft,
} from "@/lib/requests/service-Client";

import { toDateKey } from "@/lib/requestDates";
import { lexicalToPlainText } from "@/lib/lexical/utils";

function buildRequestsByDate(
  requests: Record<string, Request>
): Record<string, Request[]> {
  const map: Record<string, Request[]> = {};
  for (const r of Object.values(requests)) {
    if (!r.scheduledDate) continue;
    const key = toDateKey(r.scheduledDate);
    (map[key] ??= []).push(r);
  }
  return map;
}

function updateRequests(
  requests: Record<string, Request>,
  id: string,
  patch: Partial<Request>
): Record<string, Request> {
  const prev = requests[id];
  if (!prev) return requests; // nothing to update

  // Build a complete Request, so TS type-checks the shape
  const next: Request = { ...prev, ...patch };
  return { ...requests, [id]: next };
}

function derivePromptFieldsLocal(
  data: Partial<Request>,
  prev: Request
): { prompt: string; promptRich: Request["promptRich"] } {
  const rich = data.promptRich ?? prev.promptRich ?? null;
  const plain = data.prompt ?? (rich ? lexicalToPlainText(rich) : prev.prompt);
  return { prompt: plain, promptRich: rich };
}

interface RequestListState {
  requests: Record<string, Request>;
  requestsByDate: Record<string, Request[]>;
  drafts: () => Request[];
  actives: () => Request[];
  subscribe: (uid: string) => () => void;
  loadOne: (uid: string, id: string) => Promise<void>;
  createDraft: (
    uid: string,
    data?: Partial<Request>,
    id?: string
  ) => Promise<string>;
  ensureDraft: (uid: string) => Promise<string>;
  updateActive: (
    uid: string,
    id: string,
    data: Partial<Request>
  ) => Promise<void>;
  promoteToActive: (uid: string, id: string) => Promise<void>;
  demoteToDraft: (uid: string, id: string) => Promise<void>;
  deleteRequest: (uid: string, id: string) => Promise<void>;
  maybeCleanupEphemeral: (uid: string, id: string) => Promise<void>;
}

export const useRequestListStore = create<RequestListState>((set, get) => ({
  requests: {},
  requestsByDate: {},

  subscribe: (uid: string) => {
    const unsub = subscribeToRequestList(uid, (items) => {
      const map = Object.fromEntries(items.map((r) => [r.id, r]));
      set({ requests: map, requestsByDate: buildRequestsByDate(map) });
    });
    return unsub;
  },

  drafts: () =>
    Object.values(get().requests).filter(
      (r) => r.status === "draft" && !r.ephemeral
    ),
  actives: () =>
    Object.values(get().requests).filter((r) => r.status === "active"),

  // Keep this for deep-link fetch (before subscription is ready)
  loadOne: async (uid, id) => {
    const req = await loadOne(uid, id);
    if (req) {
      set((s) => {
        const updated = { ...s.requests, [id]: req };
        return {
          requests: updated,
          requestsByDate: buildRequestsByDate(updated),
        };
      });
    }
  },

  createDraft: async (uid, data, id) => {
    const finalId = id ?? crypto.randomUUID();
    await createDraft(uid, finalId, data ?? {});
    return finalId;
  },

  ensureDraft: async (uid) => {
    const id = await ensureDraft(uid);
    // hydrate into local state so it's immediately available
    await get().loadOne(uid, id);
    return id;
  },

  updateActive: async (uid, id, data) => {
    await updateActive(uid, id, data);

    // Optimistic update: reflect field changes instantly
    set((s) => {
      const prev = s.requests[id];
      if (!prev) return s; // safety guard

      const { prompt, promptRich } = derivePromptFieldsLocal(data, prev);

      const patch: Partial<Request> = {
        prompt,
        promptRich,
        summary: data.summary ?? prev.summary,
        summarySourcePrompt: Object.prototype.hasOwnProperty.call(
          data,
          "summarySourcePrompt"
        )
          ? data.summarySourcePrompt
          : prev.summarySourcePrompt,
        summaryStatus: Object.prototype.hasOwnProperty.call(
          data,
          "summaryStatus"
        )
          ? data.summaryStatus
          : prev.summaryStatus,
        updatedAt: new Date(),
      };

      if (Object.prototype.hasOwnProperty.call(data, "scheduledDate")) {
        patch.scheduledDate = data.scheduledDate;
      } else {
        patch.scheduledDate = prev.scheduledDate;
      }

      if (Object.prototype.hasOwnProperty.call(data, "repeat")) {
        patch.repeat = data.repeat ?? "Does not repeat";
      } else {
        patch.repeat = prev.repeat;
      }

      const updated = updateRequests(s.requests, id, patch);
      return {
        requests: updated,
        requestsByDate: buildRequestsByDate(updated),
      };
    });
  },

  promoteToActive: async (uid, id) => {
    // Firestore write
    await promoteToActive(uid, id);

    // Optimistic update
    set((s) => {
      const updated = updateRequests(s.requests, id, {
        status: "active",
        submittedAt: new Date(),
      });
      return {
        requests: updated,
        requestsByDate: buildRequestsByDate(updated),
      };
    });
  },

  demoteToDraft: async (uid, id) => {
    // Firestore write
    await demoteToDraft(uid, id);

    // Optimistic update
    set((s) => {
      const updated = updateRequests(s.requests, id, {
        status: "draft",
      });
      return {
        requests: updated,
        requestsByDate: buildRequestsByDate(updated),
      };
    });
  },

  deleteRequest: async (uid, id) => {
    await deleteRequest(uid, id);

    // Local prune makes UI snappier while waiting for snapshot
    set((s) => {
      const rest = Object.fromEntries(
        Object.entries(s.requests).filter(([key]) => key !== id)
      );
      return {
        requests: rest,
        requestsByDate: buildRequestsByDate(rest),
      };
    });
  },

  maybeCleanupEphemeral: async (uid, id) => {
    const draft = get().requests[id];
    if (
      draft &&
      draft.status === "draft" &&
      draft.ephemeral === true &&
      !draft.prompt &&
      !draft.scheduledDate
    ) {
      await deleteRequest(uid, id);
    }
  },
}));
