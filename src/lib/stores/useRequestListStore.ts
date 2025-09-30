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
  requests: Request[];
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
      set({ requests: items });
    });
    return unsub;
  },

  drafts: () => get().requests.filter((r) => r.status === "draft"),
  actives: () => get().requests.filter((r) => r.status === "active"),

  // Keep this for deep-link fetch (before subscription is ready)
  loadOne: async (uid, id) => {
    const req = await getRequest(uid, id);
    if (req) {
      set((s) => ({
        requests: [...s.requests.filter((r) => r.id !== id), req],
      }));
    }
  },

  createDraft: async (uid, data) => {
    return await createDraft(uid, data);
  },

  submitDraft: async (uid, id, data) => {
    await submitDraft(uid, id, data);

    // Optimistic update: apply submitted answers immediately
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              prompt: data.prompt ?? r.prompt ?? "",
              q1: data.q1 ?? r.q1 ?? "",
              q2: data.q2 ?? r.q2 ?? "",
              q3: data.q3 ?? r.q3 ?? "",
              scheduledDate: data.scheduledDate ?? r.scheduledDate ?? null,
              status: "active",
              submittedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  },

  updateActive: async (uid, id, data) => {
    await updateActive(uid, id, data);

    // Optimistic update: reflect field changes instantly
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              prompt: data.prompt ?? r.prompt ?? "",
              q1: data.q1 ?? r.q1 ?? "",
              q2: data.q2 ?? r.q2 ?? "",
              q3: data.q3 ?? r.q3 ?? "",
              scheduledDate: data.scheduledDate ?? r.scheduledDate ?? null,
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  },

  promoteToActive: async (uid, id) => {
    // Firestore write
    await promoteToActive(uid, id);

    // Optimistic update
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "active",
              submittedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  },

  demoteToDraft: async (uid, id) => {
    // Firestore write
    await demoteToDraft(uid, id);

    // Optimistic update
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "draft",
            }
          : r
      ),
    }));
  },

  deleteRequest: async (uid, id) => {
    await deleteRequest(uid, id);
    // Local prune makes UI snappier while waiting for snapshot
    set((s) => ({
      requests: s.requests.filter((r) => r.id !== id),
    }));
  },
}));
