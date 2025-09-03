import { useState, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Step } from "./useWorkflows";

type Direction = "up" | "down";

interface UseNodeActionsOpts {
  workflowId: string;
}

interface UseNodeActionsReturn {
  addStep: (belowId?: string) => Promise<void>;
  deleteStep: (stepId: string) => Promise<void>;
  updateStep: (stepId: string, data: Partial<Step>) => Promise<void>;
  moveStep: (stepId: string, direction: Direction) => Promise<void>;
  updateTitle: (title: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useNodeActions({
  workflowId,
}: UseNodeActionsOpts): UseNodeActionsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepCol = collection(db, "playbooks", workflowId, "steps");
  const playbookRef = doc(db, "playbooks", workflowId);

  /* ---------- helpers ---------- */
  const withOptimistic = async <T>(
    optim: () => void,
    fire: () => Promise<T>
  ) => {
    setError(null);
    setLoading(true);
    optim(); // optimistic UI
    try {
      await fire();
    } catch (e: any) {
      setError(e.message || "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const renumberOrder = async () => {
    const qSnap = await getDocs(query(stepCol, orderBy("order", "asc")));
    const batch = writeBatch(db);
    qSnap.docs.forEach((d, idx) =>
      batch.update(d.ref, { order: idx + 1, updatedAt: serverTimestamp() })
    );
    await batch.commit();
  };

  /* ---------- API ---------- */
  const addStep = useCallback(
    async (belowId?: string) => {
      const belowSnap = belowId
        ? await getDocs(query(stepCol, where("__name__", "==", belowId)))
        : null;
      const belowOrder = belowSnap?.empty
        ? null
        : belowSnap?.docs[0]?.data().order ?? 0;
      const newOrder = belowOrder === null ? 1 : belowOrder + 0.5;

      await withOptimistic(
        () => {}, // optimistic handled externally by RF state
        () =>
          addDoc(stepCol, {
            title: "New step",
            prompt: "",
            conditions: "",
            context: "",
            integration: "",
            order: newOrder,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
      );

      // clean up fractional orders
      await renumberOrder();
    },
    [stepCol]
  );

  const deleteStep = useCallback(
    async (stepId: string) => {
      await withOptimistic(
        () => {}, // optimistic handled externally
        async () => {
          await deleteDoc(doc(stepCol, stepId));
          await renumberOrder();
        }
      );
    },
    [stepCol]
  );

  const updateStep = useCallback(
    async (stepId: string, data: Partial<Step>) => {
      await withOptimistic(
        () => {},
        () =>
          updateDoc(doc(stepCol, stepId), {
            ...data,
            updatedAt: serverTimestamp(),
          })
      );
    },
    [stepCol]
  );

  const moveStep = useCallback(
    async (stepId: string, direction: Direction) => {
      const qSnap = await getDocs(query(stepCol, orderBy("order", "asc")));
      const list = qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const idx = list.findIndex((s) => s.id === stepId);
      if (idx === -1) return;

      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= list.length) return;

      const batch = writeBatch(db);
      const currRef = doc(stepCol, stepId);
      const swapRef = doc(stepCol, list[swapWith].id);
      const currOrder = list[idx].order;
      const swapOrder = list[swapWith].order;

      batch.update(currRef, { order: swapOrder, updatedAt: serverTimestamp() });
      batch.update(swapRef, { order: currOrder, updatedAt: serverTimestamp() });

      await withOptimistic(
        () => {},
        () => batch.commit()
      );
    },
    [stepCol]
  );

  const updateTitle = useCallback(
    async (title: string) => {
      await withOptimistic(
        () => {},
        () =>
          updateDoc(playbookRef, {
            title,
            updatedAt: serverTimestamp(),
          })
      );
    },
    [playbookRef]
  );

  return {
    addStep,
    deleteStep,
    updateStep,
    moveStep,
    updateTitle,
    loading,
    error,
  };
}
