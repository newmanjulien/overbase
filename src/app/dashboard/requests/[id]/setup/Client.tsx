"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { startOfToday, addDays, format, isBefore } from "date-fns";
import Setup from "./Setup";

const DRAFT_KEY = (id: string) => `request_draft:${id}`;

function getDraft<T = unknown>(id: string): T | null {
  const raw = window.sessionStorage.getItem(DRAFT_KEY(id));
  return raw ? (JSON.parse(raw) as T) : null;
}

type Draft = { id: string; prompt: string; scheduledDate: string };

function saveDraft(id: string, draft: Draft) {
  window.sessionStorage.setItem(DRAFT_KEY(id), JSON.stringify(draft));
}

function clearDraft(id: string) {
  window.sessionStorage.removeItem(DRAFT_KEY(id));
}

// Parse "YYYY-MM-DD" as a *local* date
function parseISODateLocal(s: string | null | undefined): Date | null {
  if (!s) return null;
  const parts = s.split("-");
  if (parts.length !== 3) return null;
  const [yStr, mStr, dStr] = parts;
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}

// Format Date as "YYYY-MM-DD"
function toISODateStringLocal(d: Date | null): string {
  return d ? format(d, "yyyy-MM-dd") : "";
}

interface SetupClientProps {
  requestId: string;
  prefillDate?: string;
}

export default function SetupClient({
  requestId,
  prefillDate,
}: SetupClientProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{
    prompt?: string;
    scheduledDate?: string;
  }>({});

  const minSelectableDate = useMemo(() => addDays(startOfToday(), 2), []);

  // Prefill from query string once
  useEffect(() => {
    const dateParam = prefillDate;
    if (dateParam) {
      const currentStr = scheduledDate
        ? format(scheduledDate, "yyyy-MM-dd")
        : null;
      if (currentStr !== dateParam) {
        const d = parseISODateLocal(dateParam);
        if (d) setScheduledDate(d);
      }
    }
  }, [prefillDate, scheduledDate]);

  // Load existing draft if present, otherwise fallback to localStorage
  useEffect(() => {
    const draft = getDraft<Draft>(requestId);
    if (draft) {
      if (draft.prompt) setPrompt(draft.prompt);
      if (draft.scheduledDate) {
        const parsed = parseISODateLocal(draft.scheduledDate);
        if (parsed) setScheduledDate(parsed);
      }
    } else {
      const stored = window.localStorage.getItem("requests");
      if (stored) {
        const all: Array<{
          id: string;
          prompt: string;
          scheduledDate: string;
        }> = JSON.parse(stored);
        const existing = all.find((r) => r.id === requestId);
        if (existing) {
          if (existing.prompt) setPrompt(existing.prompt);
          if (existing.scheduledDate) {
            const parsed = parseISODateLocal(existing.scheduledDate);
            if (parsed) setScheduledDate(parsed);
          }
        }
      }
    }
  }, [requestId]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!prompt.trim()) {
      errs.prompt = "Prompt is required.";
    }
    if (!scheduledDate) {
      errs.scheduledDate = "Scheduled date is required.";
    } else if (isBefore(scheduledDate, minSelectableDate)) {
      errs.scheduledDate = "Date must be at least 2 days in the future.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    saveDraft(requestId, {
      id: requestId,
      prompt,
      scheduledDate: toISODateStringLocal(scheduledDate),
    });

    router.push(`/dashboard/requests/${requestId}/questions`);
  };

  const handleCancel = () => {
    clearDraft(requestId);
    router.push("/dashboard/requests");
  };

  return (
    <Setup
      requestId={requestId}
      prompt={prompt}
      scheduledDate={scheduledDate}
      errors={errors}
      setPrompt={setPrompt}
      setScheduledDate={setScheduledDate}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      minSelectableDate={minSelectableDate}
    />
  );
}
