"use client";

import { create } from "zustand";
import type { Request } from "@/lib/models/request";
import {
  createDraft,
  submitDraft,
  updateActive,
  promoteToActive,
  demoteToDraft,
  deleteRequest,
  getRequest,
} from "@/lib/services/requestService";

import { subscribeToRequestList } from "@/lib/services/requestSubscriptions";

interface RequestListState {
  requests: Record<string, Request>;
  drafts: () => Request[];
  actives: () => Request[];
  subscribe: (uid: string) => () => void;
  loadOne: (uid: string, id: string) => Promise<void>;
  createDraft: (uid: string, data?: Partial<Request>) => Promise<Request>;
  submitDraft: (
    uid: string,
    id: string,
    data: Partial<Request>
  ) => Promise<void>;
  updateActive: (
    uid: string,
    id: string,
    data: Partial<Request>
  ) => Promise<void>;
  promoteToActive: (uid: string, id: string) => Promise<void>;
  demoteToDraft: (uid: string, id: string) => Promise<void>;
  deleteRequest: (uid: string, id: string) => Promise<void>;
}

export const useRequestListStore = create<RequestListState>((set, get) => ({
  requests: [],

  subscribe: (uid: string) => {
    const unsub = subscribeToRequestList(uid, (items) => {
      const map = Object.fromEntries(items.map((r) => [r.id, r]));
      set({ requests: map });
    });
    return unsub;
  },

  drafts: () =>
    Object.values(get().requests).filter((r) => r.status === "draft"),
  actives: () =>
    Object.values(get().requests).filter((r) => r.status === "active"),

  // Keep this for deep-link fetch (before subscription is ready)
  loadOne: async (uid, id) => {
    const req = await getRequest(uid, id);
    if (req) {
      set((s) => ({
        requests: { ...s.requests, [id]: req },
      }));
    }
  },

  createDraft: async (uid, data) => {
    return await createDraft(uid, data);
  },

  submitDraft: async (uid, id, data) => {
    await submitDraft(uid, id, data);
    set((s) => ({
      requests: {
        ...s.requests,
        [id]: {
          ...s.requests[id],
          ...data,
          status: "active",
          submittedAt: new Date().toISOString(),
        },
      },
    }));
  },

  updateActive: async (uid, id, data) => {
    await updateActive(uid, id, data);

    // Optimistic update: reflect field changes instantly
    set((s) => ({
      requests: {
        ...s.requests,
        [id]: {
          ...s.requests[id],
          prompt: data.prompt ?? s.requests[id].prompt ?? "",
          q1: data.q1 ?? s.requests[id].q1 ?? "",
          q2: data.q2 ?? s.requests[id].q2 ?? "",
          q3: data.q3 ?? s.requests[id].q3 ?? "",
          scheduledDate:
            data.scheduledDate ?? s.requests[id].scheduledDate ?? null,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  },

  promoteToActive: async (uid, id) => {
    // Firestore write
    await promoteToActive(uid, id);

    // Optimistic update
    set((s) => ({
      requests: {
        ...s.requests,
        [id]: {
          ...s.requests[id],
          status: "active",
          submittedAt: new Date().toISOString(),
        },
      },
    }));
  },

  demoteToDraft: async (uid, id) => {
    // Firestore write
    await demoteToDraft(uid, id);

    // Optimistic update
    set((s) => ({
      requests: {
        ...s.requests,
        [id]: {
          ...s.requests[id],
          status: "draft",
        },
      },
    }));
  },

  deleteRequest: async (uid, id) => {
    await deleteRequest(uid, id);
    // Local prune makes UI snappier while waiting for snapshot
    set((s) => {
      const { [id]: _, ...rest } = s.requests;
      return { requests: rest };
    });
  },
}));
