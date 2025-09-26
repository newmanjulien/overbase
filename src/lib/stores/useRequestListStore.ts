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

interface RequestListState {
  requests: Request[];
  drafts: () => Request[];
  actives: () => Request[];
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

  drafts: () => get().requests.filter((r) => r.status === "draft"),
  actives: () => get().requests.filter((r) => r.status === "active"),

  loadOne: async (uid, id) => {
    const req = await getRequest(uid, id);
    if (req) {
      set((s) => ({
        requests: [...s.requests.filter((r) => r.id !== id), req],
      }));
    }
  },

  createDraft: async (uid, data) => {
    const draft = await createDraft(uid, data);
    set((s) => ({ requests: [...s.requests, draft] }));
    return draft;
  },

  submitDraft: async (uid, id, data) => {
    await submitDraft(uid, id, data);
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, ...data, status: "active" } : r
      ),
    }));
  },

  updateActive: async (uid, id, data) => {
    await updateActive(uid, id, data);
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }));
  },

  promoteToActive: async (uid, id) => {
    await promoteToActive(uid, id);
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status: "active" } : r
      ),
    }));
  },

  demoteToDraft: async (uid, id) => {
    await demoteToDraft(uid, id);
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status: "draft" } : r
      ),
    }));
  },

  deleteRequest: async (uid, id) => {
    await deleteRequest(uid, id);
    set((s) => ({
      requests: s.requests.filter((r) => r.id !== id),
    }));
  },
}));
