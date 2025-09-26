"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { minSelectableDate, isBeforeDate } from "@/lib/requestDates";
import Setup from "./Setup";

import { useAuth } from "@/lib/auth";
import { createRequestFormStore } from "@/lib/stores/useRequestFormStore";
import { useRequestListStore } from "@/lib/stores/useRequestListStore";

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

  const useFormStore = useMemo(
    () => createRequestFormStore(requestId),
    [requestId]
  );
  const { data, updateData, setAllData } = useFormStore();

  const [errors, setErrors] = useState<{
    prompt?: string;
    scheduledDate?: string;
  }>({});

  const [status, setStatus] = useState<"draft" | "active">("draft");

  const handleStatusChange = async (val: "draft" | "active") => {
    setStatus(val);
    if (user) {
      await updateStatus(user.uid, requestId, val);
    }
  };

  const minSelectableDateValue = useMemo(() => minSelectableDate(2), []);

  // Prefill from query string once
  useEffect(() => {
    if (prefillDate) {
      const [y, m, d] = prefillDate.split("-").map(Number);
      const dObj = new Date(y, m - 1, d);
      if (
        !data.step1?.scheduledDate ||
        data.step1.scheduledDate.getTime() !== dObj.getTime()
      ) {
        updateData("step1", { scheduledDate: dObj });
      }
    }
  }, [prefillDate, data.step1?.scheduledDate, updateData]);

  // Ask the list store to fetch this request into memory
  useEffect(() => {
    if (!user) return;
    loadOne(user.uid, requestId);
  }, [user, requestId, loadOne]);

  // When the request appears in the list store, seed the form + local status once
  useEffect(() => {
    const existing = requests.find((r) => r.id === requestId);
    if (!existing) return;

    // Seed form if empty
    if (!data?.step1 && !data?.step2) {
      setAllData(existing as any); // your form store expects the flat request shape; you already map fields below
    }

    // Seed local status
    setStatus(existing.status);
  }, [requests, requestId, data?.step1, data?.step2, setAllData]);

  // Debounced auto-save when step1 fields change
  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(() => {
      saveDraft(user.uid, requestId, {
        ...data,
        step1: {
          prompt: data.step1?.prompt ?? "",
          scheduledDate: data.step1?.scheduledDate ?? null,
        },
      }).catch(() => {});
    }, 800);

    return () => clearTimeout(timeout);
  }, [data.step1?.prompt, data.step1?.scheduledDate, user, requestId, data]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!data.step1?.prompt?.trim()) {
      errs.prompt = "Prompt is required.";
    }
    if (!data.step1?.scheduledDate) {
      errs.scheduledDate = "Scheduled date is required.";
    } else if (isBeforeDate(data.step1.scheduledDate, minSelectableDateValue)) {
      errs.scheduledDate = "Date must be at least 2 days in the future.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    if (!user) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }

    await saveDraft(user.uid, requestId, {
      ...data,
      step1: {
        scheduledDate: data.step1?.scheduledDate ?? null,
        prompt: data.step1?.prompt ?? "",
      },
    });

    router.push(`/dashboard/requests/${requestId}/questions`);
  };

  const handleCancel = async (): Promise<void> => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "requests", requestId));
    }
    router.push("/dashboard/requests");
  };

  const handleHome = async (): Promise<void> => {
    router.push("/dashboard/requests");
  };

  const handleMakeDraft = async (): Promise<void> => {
    // for now, do nothing
    console.log("Make draft clicked");
  };

  return (
    <Setup
      prompt={data.step1?.prompt ?? ""}
      scheduledDate={data.step1?.scheduledDate ?? null}
      errors={errors}
      setPrompt={(val) => updateData("step1", { prompt: val })}
      setScheduledDate={(val) => updateData("step1", { scheduledDate: val })}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onHome={handleHome}
      onDraft={handleMakeDraft}
      minSelectableDate={minSelectableDateValue}
      status={status}
      setStatus={handleStatusChange}
      mode={mode}
    />
  );
}
