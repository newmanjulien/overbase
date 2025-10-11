"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsUI from "./Questions";
import { useDashboard } from "@/lib/dashboard/DashboardProvider";
import { useRequestActions } from "@/lib/requests/hooks";
import { toDateKey } from "@/lib/requests/Dates";

interface QuestionsClientProps {
  requestId: string;
  mode: "create" | "edit" | "editDraft";
}

export default function QuestionsClient({
  requestId,
  mode,
}: QuestionsClientProps) {
  const router = useRouter();

  const [summary, setSummary] = useState<string>("");

  const { uid, requests } = useDashboard();
  const { updateActive, deleteRequest, promoteToActive, demoteToDraft } =
    useRequestActions();

  const existing = requests[requestId];

  useEffect(() => {
    if (!existing) {
      router.push(`/dashboard/requests/${requestId}/prompt`);
      return;
    }

    // Only hydrate once, when summary is empty but Firestore has data
    if (!summary && existing.summary) {
      setSummary(existing.summary);
    }
  }, [existing, router, requestId, summary]);

  const status = existing?.status ?? "draft";

  const dateParam = existing?.scheduledDate
    ? `?date=${toDateKey(existing.scheduledDate)}`
    : "";
  const dateParamWithAmp = existing?.scheduledDate
    ? `&date=${toDateKey(existing.scheduledDate)}`
    : "";

  // Submit handler
  const handleSubmit = async (): Promise<void> => {
    if (!uid) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }
    try {
      // Ensure latest answers are saved before promoting
      const patch: Parameters<typeof updateActive>[2] = {
        summary,
        summaryStatus: "ready",
      };
      await updateActive(uid, requestId, patch);
      await promoteToActive(uid, requestId);
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
    if (uid) {
      await deleteRequest(uid, requestId);
    }
    router.push(`/dashboard/requests${dateParam}`);
  };

  const handleHome = async (): Promise<void> => {
    if (mode === "create") {
      const confirmed = window.confirm(
        "Are you sure you want to return to the dashboard? Your request will not be created"
      );
      if (!confirmed) return;

      if (uid) {
        try {
          await deleteRequest(uid, requestId);
        } catch (err) {
          console.error("Failed to delete draft during back navigation", err);
        }
      }
    }

    router.push(`/dashboard/requests`);
  };

  const handleStatusChange = async (val: "draft" | "active") => {
    if (!uid) return;
    if (val === "active") await promoteToActive(uid, requestId);
    else await demoteToDraft(uid, requestId);
  };

  const infoMessage =
    existing?.summaryStatus === "failed"
      ? "Could not generate summary automatically."
      : null;

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
      infoMessage={infoMessage}
    />
  );
}
