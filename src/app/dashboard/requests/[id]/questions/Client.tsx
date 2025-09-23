"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RequestItem } from "../../Client";
import QuestionsUI from "./Questions";

const DRAFT_KEY = (id: string) => `request_draft:${id}`;

function getDraft<T = unknown>(id: string): T | null {
  const raw = window.sessionStorage.getItem(DRAFT_KEY(id));
  return raw ? (JSON.parse(raw) as T) : null;
}
function clearDraft(id: string) {
  window.sessionStorage.removeItem(DRAFT_KEY(id));
}

interface QuestionsClientProps {
  requestId: string;
}

export default function QuestionsClient({ requestId }: QuestionsClientProps) {
  const router = useRouter();

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("requests");
    if (stored) {
      const all: RequestItem[] = JSON.parse(stored);
      const existing = all.find((r) => r.id === requestId);
      if (existing) {
        if (existing.q1) setQ1(existing.q1);
        if (existing.q2) setQ2(existing.q2);
        if (existing.q3) setQ3(existing.q3);
      }
    }
  }, [requestId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const draft = getDraft<{
      id: string;
      prompt: string;
      scheduledDate: string;
    }>(requestId);

    const stored = window.localStorage.getItem("requests");
    const all: RequestItem[] = stored ? JSON.parse(stored) : [];

    const idx = all.findIndex((r) => r.id === requestId);

    if (idx >= 0) {
      const existing = all[idx];
      all[idx] = {
        ...existing,
        ...(draft
          ? { prompt: draft.prompt, scheduledDate: draft.scheduledDate }
          : {}),
        q1,
        q2,
        q3,
      };
    } else {
      if (!draft) {
        // Graceful fallback: redirect back to setup if no draft
        router.push(`/dashboard/requests/${requestId}/setup`);
        return;
      }
      const newItem: RequestItem = {
        id: requestId,
        prompt: draft.prompt || "",
        scheduledDate: draft.scheduledDate || "",
        q1,
        q2,
        q3,
      };
      all.push(newItem);
    }

    window.localStorage.setItem("requests", JSON.stringify(all));
    clearDraft(requestId);

    router.push("/dashboard/requests");
  };

  const handleCancel = () => {
    clearDraft(requestId);
    router.push("/dashboard/requests");
  };

  const handleBack = () => {
    router.push(`/dashboard/requests/${requestId}/setup`);
  };

  return (
    <QuestionsUI
      q1={q1}
      q2={q2}
      q3={q3}
      setQ1={setQ1}
      setQ2={setQ2}
      setQ3={setQ3}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onBack={handleBack}
    />
  );
}
