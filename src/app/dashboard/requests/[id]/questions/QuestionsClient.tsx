"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsUI from "./Questions";
import { useDashboard } from "@/lib/dashboard/AdminProvider";
import { useRequestActions } from "@/lib/requests/hooks";
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
  const { updateActive, deleteRequest, promoteToActive, demoteToDraft } =
    useRequestActions();

  const existing = requests[requestId];

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
        refineJson,
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

  // const handleRefresh = async (): Promise<void> => {
  //   if (!uid || !existing) return;
  //   setIsRefreshing(true);
  //   try {
  //     const promptText = existing.promptRich
  //       ? lexicalToPlainText(existing.promptRich)
  //       : existing.prompt;

  //     await fetch("/api/refine", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ text: promptText.trim(), requestId, uid }),
  //     });
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  const handleRefresh = async (): Promise<void> => {
    if (!uid || !existing) return;
    setIsRefreshing(true);

    try {
      const promptText = existing.promptRich
        ? lexicalToPlainText(existing.promptRich)
        : existing.prompt;

      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: promptText.trim(), requestId, uid }),
      });

      if (!res.ok) throw new Error(`Refine failed with ${res.status}`);

      // Parse the new questions from the response
      const data = (await res.json()) as {
        refineJson?: string;
        refineItems?: { question: string; answer: string }[];
        serverUpdated?: boolean;
      };

      // Convert response to refineJson string
      const newRefineJson =
        data.refineJson ?? JSON.stringify(data.refineItems ?? [], null, 0);

      // Update UI immediately
      setRefineJson(newRefineJson);

      // Persist to Firestore if backend didn't already
      if (!data.serverUpdated) {
        await updateActive(uid, requestId, { refineJson: newRefineJson });
      }
    } catch (err) {
      console.error("Refresh failed:", err);
      alert("Failed to refresh questions. Check console for details.");
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
      setStatus={mode !== "create" ? handleStatusChange : undefined}
      mode={mode}
      infoMessage={infoMessage}
      isRefreshing={isRefreshing}
    />
  );
}
