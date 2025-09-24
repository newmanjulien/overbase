"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RequestData {
  step1?: {
    prompt?: string;
    scheduledDate?: Date | null;
  };
  step2?: {
    q1?: string;
    q2?: string;
    q3?: string;
  };
  status?: "draft" | "submitted";
  id?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface RequestState {
  currentStep: number;
  data: RequestData;
  setStep: (n: number) => void;
  updateData: <K extends keyof RequestData>(
    step: K,
    values: NonNullable<RequestData[K]>
  ) => void;
  setAllData: (data: RequestData) => void;
  reset: () => void;
}

/**
 * Hook factory: returns a bound Zustand hook for a specific requestId.
 */
export const createRequestStore = (requestId?: string) =>
  create<RequestState>()(
    persist(
      (set) => ({
        currentStep: 1,
        data: { id: requestId },
        setStep: (n) => set({ currentStep: n }),
        updateData: (step, values) =>
          set((s) => ({
            data: {
              ...s.data,
              [step]: { ...(s.data[step] || {}), ...values },
            },
          })),
        setAllData: (data) => set({ data }),
        reset: () => set({ currentStep: 1, data: { id: requestId } }),
      }),
      {
        name: requestId
          ? `request_draft:${requestId}`
          : "request_draft:__new__",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  );
