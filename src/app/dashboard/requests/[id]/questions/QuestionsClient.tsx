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

  const [summary, setSummary] = useState<string>("");

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
    if (!summary && existing.summary) setSummary(existing.summary);
  }, [requests, requestId, summary, router]);

  // Debounced auto-save for answers
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      updateActive(user.uid, requestId, { summary }).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [user, requestId, summary, updateActive]);

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
      await updateActive(user.uid, requestId, { summary });
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
      summary={summary ?? ""}
      setSummary={setSummary}
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
