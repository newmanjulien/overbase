"use client";

import { create } from "zustand";
import type { Request } from "@/lib/models/request-client";
import {
  createDraft,
  submitDraft,
  updateActive,
  promoteToActive,
  demoteToDraft,
  deleteRequest,
  getRequest,
} from "@/lib/services/requestService-admin";

import { toDateKey } from "@/lib/requestDates";

import { subscribeToRequestList } from "@/lib/services/requestService-client";

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
  ) => Promise<Request>;
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
    Object.values(get().requests).filter((r) => r.status === "draft"),
  actives: () =>
    Object.values(get().requests).filter((r) => r.status === "active"),

  // Keep this for deep-link fetch (before subscription is ready)
  loadOne: async (uid, id) => {
    const req = await getRequest(uid, id);
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
    return await createDraft(uid, data, id);
  },

  submitDraft: async (uid, id, data) => {
    await submitDraft(uid, id, data);

    set((s) => {
      const updated = updateRequests(s.requests, id, {
        ...data,
        status: "active", // explicit union member
        submittedAt: new Date().toISOString(),
      });
      return {
        requests: updated,
        requestsByDate: buildRequestsByDate(updated),
      };
    });
  },

  updateActive: async (uid, id, data) => {
    await updateActive(uid, id, data);

    // Optimistic update: reflect field changes instantly
    set((s) => {
      const updated = updateRequests(s.requests, id, {
        prompt: data.prompt ?? s.requests[id].prompt,
        q1: data.q1 ?? s.requests[id].q1,
        q2: data.q2 ?? s.requests[id].q2,
        q3: data.q3 ?? s.requests[id].q3,
        scheduledDate: data.scheduledDate ?? s.requests[id].scheduledDate,
        updatedAt: new Date().toISOString(),
      });
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
        submittedAt: new Date().toISOString(),
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
}));
