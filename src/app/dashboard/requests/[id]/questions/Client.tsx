"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import QuestionsUI from "./Questions";
import { useAuth } from "@/lib/auth";
import {
  getRequest,
  saveDraft,
  submitRequest,
} from "@/lib/services/requestService";
import { useRequestStore } from "@/lib/stores/useRequestStore";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface QuestionsClientProps {
  requestId: string;
}

export default function QuestionsClient({ requestId }: QuestionsClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const storeRef = useRef<ReturnType<typeof useRequestStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = useRequestStore(requestId);
  }
  const useStore = storeRef.current!;
  const { data, updateData, setAllData } = useStore();

  // Hydrate once from Firestore if store is empty
  useEffect(() => {
    if (!user) return;
    if (data && (data.step1 || data.step2)) return;
    (async () => {
      const existing = await getRequest(user.uid, requestId);
      if (existing) {
        setAllData(existing);
      } else {
        router.push(`/dashboard/requests/${requestId}/setup`);
      }
    })();
  }, [user, requestId, router, data, setAllData]);

  // Debounced saveDraft when answers change
  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(() => {
      saveDraft(user.uid, requestId, {
        ...data,
        step1: {
          prompt: data.step1?.prompt ?? "",
          scheduledDate: data.step1?.scheduledDate ?? null, // ✅ keep as Date internally
        },
        step2: {
          q1: data.step2?.q1 ?? "",
          q2: data.step2?.q2 ?? "",
          q3: data.step2?.q3 ?? "",
        },
      }).catch(() => {});
    }, 800);

    return () => clearTimeout(timeout);
  }, [
    data.step2?.q1,
    data.step2?.q2,
    data.step2?.q3,
    data.step1?.prompt,
    data.step1?.scheduledDate,
    user,
    requestId,
    data,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }

    try {
      await submitRequest(user.uid, requestId, data);
      router.push("/dashboard/requests");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed — check console for details.");
    }
  };

  const handleCancel = async () => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "requests", requestId));
    }
    router.push("/dashboard/requests");
  };

  const handleBack = () => {
    router.push(`/dashboard/requests/${requestId}/setup`);
  };

  return (
    <QuestionsUI
      q1={data.step2?.q1 ?? ""}
      q2={data.step2?.q2 ?? ""}
      q3={data.step2?.q3 ?? ""}
      setQ1={(val) => updateData("step2", { q1: val })}
      setQ2={(val) => updateData("step2", { q2: val })}
      setQ3={(val) => updateData("step2", { q3: val })}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onBack={handleBack}
    />
  );
}
