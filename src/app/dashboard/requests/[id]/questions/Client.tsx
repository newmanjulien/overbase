"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RequestItem } from "../../Client";
import QuestionsUI from "./Questions";

// ---- Storage helpers ----
const DRAFT_KEY = (id: string) => `request_draft:${id}`;

function getDraft<T = unknown>(id: string): T | null {
  const raw = window.sessionStorage.getItem(DRAFT_KEY(id));
  return raw ? (JSON.parse(raw) as T) : null;
}

function saveDraft<T = unknown>(id: string, draft: T) {
  window.sessionStorage.setItem(DRAFT_KEY(id), JSON.stringify(draft));
}

function clearDraft(id: string) {
  window.sessionStorage.removeItem(DRAFT_KEY(id));
}

function loadRequests(): RequestItem[] {
  try {
    return JSON.parse(window.localStorage.getItem("requests") || "[]");
  } catch {
    return [];
  }
}

function saveRequests(requests: RequestItem[]) {
  window.localStorage.setItem("requests", JSON.stringify(requests));
}

function upsertRequest(request: RequestItem) {
  const all = loadRequests();
  const idx = all.findIndex((r) => r.id === request.id);
  if (idx >= 0) {
    all[idx] = request;
  } else {
    all.push(request);
  }
  saveRequests(all);
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
    const all = loadRequests();
    const existing = all.find((r) => r.id === requestId);
    if (existing) {
      if (existing.q1) setQ1(existing.q1);
      if (existing.q2) setQ2(existing.q2);
      if (existing.q3) setQ3(existing.q3);
    }

    const draft = getDraft<{
      id: string;
      prompt: string;
      scheduledDate: string;
      q1?: string;
      q2?: string;
      q3?: string;
    }>(requestId);

    if (draft) {
      if (draft.q1) setQ1(draft.q1);
      if (draft.q2) setQ2(draft.q2);
      if (draft.q3) setQ3(draft.q3);
    }
  }, [requestId]);

  useEffect(() => {
    const draft = getDraft<{
      id: string;
      prompt: string;
      scheduledDate: string;
      q1?: string;
      q2?: string;
      q3?: string;
    }>(requestId);

    if (draft) {
      saveDraft(requestId, {
        ...draft,
        q1,
        q2,
        q3,
      });
    }
  }, [q1, q2, q3, requestId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const draft = getDraft<{
      id: string;
      prompt: string;
      scheduledDate: string;
      q1?: string;
      q2?: string;
      q3?: string;
    }>(requestId);

    const all = loadRequests();
    const idx = all.findIndex((r) => r.id === requestId);

    if (idx >= 0) {
      const existing = all[idx];
      upsertRequest({
        ...existing,
        ...(draft
          ? {
              prompt: draft.prompt,
              scheduledDate: draft.scheduledDate,
              q1: draft.q1 ?? q1,
              q2: draft.q2 ?? q2,
              q3: draft.q3 ?? q3,
            }
          : { q1, q2, q3 }),
      });
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
        q1: draft.q1 ?? q1,
        q2: draft.q2 ?? q2,
        q3: draft.q3 ?? q3,
      };
      upsertRequest(newItem);
    }

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
