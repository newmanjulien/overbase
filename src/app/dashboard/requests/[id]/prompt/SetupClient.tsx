"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  minSelectableDate,
  isBeforeDate,
  fromDateKey,
  isFutureDate,
  toDateKey,
  type DateKey,
} from "@/lib/requestDates";
import Setup from "./Setup";

import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/stores/useRequestStore";

interface SetupClientProps {
  requestId: string;
  prefillDate?: string;
  mode: "create" | "edit" | "editDraft";
}

export default function SetupClient({
  requestId,
  prefillDate,
  mode,
}: SetupClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  const {
    requests,
    loadOne,
    updateActive,
    promoteToActive,
    demoteToDraft,
    deleteRequest,
  } = useRequestListStore();

  const [errors, setErrors] = useState<{
    prompt?: string;
    scheduledDate?: string;
  }>({});

  const didPrefill = React.useRef(false);
  const didHydrateFromFirestore = React.useRef(false);

  const minSelectableDateValue = useMemo(() => minSelectableDate(2), []);

  useEffect(() => {
    if (didPrefill.current) return;
    if (prefillDate) {
      setScheduledDate(fromDateKey(prefillDate as DateKey));
      didPrefill.current = true;
    }
  }, [prefillDate]);

  useEffect(() => {
    if (!user) return;
    loadOne(user.uid, requestId);
  }, [user, requestId, loadOne]);

  useEffect(() => {
    const existing = requests[requestId];
    if (!existing) return;

    // Only hydrate once, to avoid overwriting user edits
    if (!didHydrateFromFirestore.current) {
      if (existing.prompt) setPrompt(existing.prompt);
      if (existing.scheduledDate) setScheduledDate(existing.scheduledDate);
      didHydrateFromFirestore.current = true;
    }
  }, [requests, requestId]);

  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      updateActive(user.uid, requestId, {
        prompt: prompt ?? "",
        scheduledDate: scheduledDate ?? null,
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [prompt, scheduledDate, user, requestId, updateActive]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!prompt?.trim()) {
      errs.prompt = "Prompt is required.";
    }
    if (!scheduledDate) {
      errs.scheduledDate = "Scheduled date is required.";
    } else if (!isFutureDate(scheduledDate)) {
      errs.scheduledDate = "Date must be in the future.";
    } else if (isBeforeDate(scheduledDate, minSelectableDateValue)) {
      errs.scheduledDate = "Date must be at least 2 days in the future.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const existing = requests[requestId];
  const status = existing?.status ?? "draft";

  const dateParam = scheduledDate ? `?date=${toDateKey(scheduledDate)}` : "";
  const dateParamWithAmp = scheduledDate
    ? `&date=${toDateKey(scheduledDate)}`
    : "";

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    if (!user) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }
    await updateActive(user.uid, requestId, {
      prompt: prompt ?? "",
      scheduledDate: scheduledDate ?? null,
    });

    router.push(
      `/dashboard/requests/${requestId}/loading?mode=${mode}${dateParamWithAmp}`
    );
  };

  const handleCancel = async (): Promise<void> => {
    if (mode === "create") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this draft request? This will delete the draft and cannot be undone"
      );
      if (!confirmed) return;
      if (user) {
        await deleteRequest(user.uid, requestId);
      }
    }
    router.push(`/dashboard/requests${dateParam}`);
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
    const existing = requests[requestId];

    if (existing?.status === "draft" && !existing?.scheduledDate) {
      alert(
        "This draft has no scheduled date.\n\nPlease add a scheduled date before leaving, or cancel this draft instead."
      );
      return;
    }

    router.push(`/dashboard/requests${dateParam}`);
    return;
  };

  const handleStatusChange = async (val: "draft" | "active") => {
    if (!user) return;
    if (val === "active") await promoteToActive(user.uid, requestId);
    else await demoteToDraft(user.uid, requestId);
  };

  return (
    <Setup
      prompt={prompt ?? ""}
      scheduledDate={scheduledDate ?? null}
      errors={errors}
      setPrompt={setPrompt}
      setScheduledDate={setScheduledDate}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onHome={handleHome}
      onDelete={handleDelete}
      minSelectableDate={minSelectableDateValue}
      status={status}
      setStatus={mode !== "create" ? handleStatusChange : undefined}
      mode={mode}
    />
  );
}
