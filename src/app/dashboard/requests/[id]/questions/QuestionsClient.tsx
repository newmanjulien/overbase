"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsUI from "./Questions";
import { useDashboard } from "@/lib/dashboard/AdminProvider";
import { useRequestActions } from "@/lib/requests/hooks";
import { useRequestNavigation } from "@/lib/requests/useRequestNavigation";
import { toDateKey } from "@/lib/requests/Dates";
import { lexicalToPlainText } from "@/lib/lexical/utils";

interface QuestionsClientProps {
  requestId: string;
  mode: "create" | "edit" | "editDraft";
}

export default function QuestionsClient({
  requestId,
  mode,
}: QuestionsClientProps) {
  const router = useRouter();

  const [refineJson, setRefineJson] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { uid, requests } = useDashboard();
  const { updateActive } = useRequestActions();

  const existing = requests[requestId];

  const { status, handleHome, handleDelete, handleStatusChange } =
    useRequestNavigation({
      requestId,
      mode,
      uid,
      existing,
    });

  useEffect(() => {
    if (!existing) {
      router.push(`/dashboard/requests/${requestId}/prompt`);
      return;
    }

    // Only hydrate once, when refineJson is empty but Firestore has data
    if (!refineJson && existing.refineJson) {
      setRefineJson(existing.refineJson);
    }
  }, [existing, router, requestId, refineJson]);

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
        refineJson,
      };
      await updateActive(uid, requestId, patch);
      // Promote to active using the hook's handler
      if (handleStatusChange) {
        await handleStatusChange("active");
      }
      router.push(`/dashboard/requests${dateParam}`);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed — check console for details.");
    }
  };

  const handleBack = async (): Promise<void> => {
    router.push(
      `/dashboard/requests/${requestId}/prompt?mode=${mode}${dateParamWithAmp}`,
    );
  };

  const handleRefresh = async (): Promise<void> => {
    if (!uid || !existing) return;
    setIsRefreshing(true);
    try {
      const promptText = existing.promptRich
        ? lexicalToPlainText(existing.promptRich)
        : existing.prompt;

      await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: promptText.trim(), requestId, uid }),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const infoMessage =
    !refineJson || refineJson.trim() === ""
      ? "Could not generate clarifying questions."
      : null;

  return (
    <QuestionsUI
      refineJson={refineJson ?? ""}
      setRefineJson={setRefineJson}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onHome={handleHome}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
      status={status}
      setStatus={handleStatusChange}
      mode={mode}
      infoMessage={infoMessage}
      isRefreshing={isRefreshing}
    />
  );
}
