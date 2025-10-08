"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmUI from "./Confirm";
import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/requests/store";
import { toDateKey } from "@/lib/requests/Dates";

interface ConfirmClientProps {
  requestId: string;
  mode: "create" | "edit" | "editDraft";
}

export default function ConfirmClient({ requestId, mode }: ConfirmClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [summary, setSummary] = useState<string>("");
  const [summarySourcePrompt, setSummarySourcePrompt] = useState<string>("");

  // Global list store
  const {
    requests,
    loadOne,
    updateActive,
    deleteRequest,
    promoteToActive,
    demoteToDraft,
  } = useRequestListStore();

  const existing = requests[requestId];

  // Hydrate request into global store
  useEffect(() => {
    if (!user) return;
    loadOne(user.uid, requestId);
  }, [user, requestId, loadOne]);

  useEffect(() => {
    const current = existing;
    if (!current) {
      router.push(`/dashboard/requests/${requestId}/prompt`);
      return;
    }
    if (!summary && current.summary) setSummary(current.summary);
    if (!summarySourcePrompt && current.summarySourcePrompt) {
      setSummarySourcePrompt(current.summarySourcePrompt);
    }
  }, [existing, requestId, router, summary, summarySourcePrompt]);

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
      const promptSnapshot = existing?.prompt ?? summarySourcePrompt;
      const patch: Parameters<typeof updateActive>[2] = {
        summary,
        summarySourcePrompt: promptSnapshot,
        summaryStatus: "ready",
      };
      await updateActive(user.uid, requestId, patch);
      await promoteToActive(user.uid, requestId);
      router.push(`/dashboard/requests${dateParam}`);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed — check console for details.");
    }
  };

  const handleBack = async (): Promise<void> => {
    router.push(
      `/dashboard/requests/${requestId}/prompt?mode=${mode}${dateParamWithAmp}`
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
    const confirmed = window.confirm(
      "Are you sure you want to return to the dashboard? Your changes will be deleted."
    );
    if (!confirmed) return;

    if (mode === "create") {
      // Delete draft if we're still creating a new one
      if (user) {
        try {
          await deleteRequest(user.uid, requestId);
        } catch (err) {
          console.error("Failed to delete draft during back navigation", err);
        }
      }
    }

    router.push(`/dashboard/requests`);
  };

  const handleStatusChange = async (val: "draft" | "active") => {
    if (!user) return;
    if (val === "active") await promoteToActive(user.uid, requestId);
    else await demoteToDraft(user.uid, requestId);
  };

  const infoMessage =
    existing?.summaryStatus === "failed"
      ? "Could not generate summary automatically."
      : null;

  return (
    <ConfirmUI
      summary={summary ?? ""}
      setSummary={setSummary}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onHome={handleHome}
      onDelete={handleDelete}
      status={status}
      setStatus={mode !== "create" ? handleStatusChange : undefined}
      mode={mode}
      infoMessage={infoMessage}
    />
  );
}
