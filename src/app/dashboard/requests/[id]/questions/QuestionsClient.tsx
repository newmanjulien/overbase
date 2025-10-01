"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsUI from "./Questions";
import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/stores/useRequestStore";
import { toDateKey } from "@/lib/requestDates";

interface QuestionsClientProps {
  requestId: string;
  mode: "create" | "edit" | "editDraft";
}

export default function QuestionsClient({
  requestId,
  mode,
}: QuestionsClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [q1, setQ1] = useState<string>("");
  const [q2, setQ2] = useState<string>("");
  const [q3, setQ3] = useState<string>("");

  // Global list store
  const {
    requests,
    loadOne,
    updateActive,
    deleteRequest,
    promoteToActive,
    demoteToDraft,
  } = useRequestListStore();

  // Hydrate request into global store
  useEffect(() => {
    if (!user) return;
    loadOne(user.uid, requestId);
  }, [user, requestId, loadOne]);

  useEffect(() => {
    const existing = requests[requestId];
    if (!existing) {
      router.push(`/dashboard/requests/${requestId}/setup`);
      return;
    }
    if (!q1 && existing.q1) setQ1(existing.q1);
    if (!q2 && existing.q2) setQ2(existing.q2);
    if (!q3 && existing.q3) setQ3(existing.q3);
  }, [requests, requestId, q1, q2, q3, router]);

  // Debounced auto-save for answers
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      updateActive(user.uid, requestId, { q1, q2, q3 }).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [user, requestId, q1, q2, q3, updateActive]);

  const existing = requests[requestId];
  const status = existing?.status ?? "draft";

  const dateParam = existing?.scheduledDate
    ? `?date=${toDateKey(existing.scheduledDate)}`
    : "";
  const dateParamWithAmp = existing?.scheduledDate
    ? `&date=${toDateKey(existing.scheduledDate)}`
    : "";

  // Submit handler
  const handleSubmit = async (): Promise<void> => {
    if (!user) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }
    try {
      // Ensure latest answers are saved before promoting
      await updateActive(user.uid, requestId, { q1, q2, q3 });
      await promoteToActive(user.uid, requestId);
      router.push(`/dashboard/requests${dateParam}`);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed — check console for details.");
    }
  };

  const handleBack = async (): Promise<void> => {
    router.push(
      `/dashboard/requests/${requestId}/setup?mode=${mode}${dateParamWithAmp}`
    );
  };

  const handleDelete = async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this request?"
    );
    if (!confirmed) return;
    if (user) {
      await deleteRequest(user.uid, requestId);
    }
    router.push(`/dashboard/requests${dateParam}`);
  };

  const handleHome = async (): Promise<void> => {
    router.push(`/dashboard/requests${dateParam}`);
  };

  const handleStatusChange = async (val: "draft" | "active") => {
    if (!user) return;
    if (val === "active") await promoteToActive(user.uid, requestId);
    else await demoteToDraft(user.uid, requestId);
  };

  return (
    <QuestionsUI
      q1={q1 ?? ""}
      q2={q2 ?? ""}
      q3={q3 ?? ""}
      setQ1={setQ1}
      setQ2={setQ2}
      setQ3={setQ3}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onHome={handleHome}
      onDelete={handleDelete}
      status={status}
      setStatus={mode !== "create" ? handleStatusChange : undefined}
      mode={mode}
    />
  );
}
