"use client";

import { create } from "zustand";

interface RequestFormState {
  step: number;
  prompt: string;
  scheduledDate: Date | null;
  q1: string;
  q2: string;
  q3: string;
  setStep: (s: number) => void;
  setPrompt: (p: string) => void;
  setScheduledDate: (d: Date | null) => void;
  setQ1: (v: string) => void;
  setQ2: (v: string) => void;
  setQ3: (v: string) => void;
  reset: () => void;
}

export const createRequestFormStore = (requestId: string) =>
  create<RequestFormState>((set) => ({
    step: 1,
    prompt: "",
    scheduledDate: null,
    q1: "",
    q2: "",
    q3: "",

    setStep: (s) => set({ step: s }),
    setPrompt: (p) => set({ prompt: p }),
    setScheduledDate: (d) => set({ scheduledDate: d }),
    setQ1: (v) => set({ q1: v }),
    setQ2: (v) => set({ q2: v }),
    setQ3: (v) => set({ q3: v }),

    reset: () =>
      set({
        step: 1,
        prompt: "",
        scheduledDate: null,
        q1: "",
        q2: "",
        q3: "",
      }),
  }));
