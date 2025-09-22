"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RequestItem } from "../../Client";
import SetupLayout from "@/components/layouts/SetupLayout";

const DRAFT_KEY = (id: string) => `request_draft:${id}`;

function getDraft<T = unknown>(id: string): T | null {
  const raw = window.sessionStorage.getItem(DRAFT_KEY(id));
  return raw ? (JSON.parse(raw) as T) : null;
}
function clearDraft(id: string) {
  window.sessionStorage.removeItem(DRAFT_KEY(id));
}

interface QuestionsProps {
  requestId: string;
}

export default function Questions({ requestId }: QuestionsProps) {
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

  return (
    <SetupLayout
      // Sidebar
      sidebarBackText="Back to requests"
      onSidebarBack={() => {
        clearDraft(requestId);
        router.push("/dashboard/requests");
      }}
      sidebarTitle="Answer 3 short questions"
      // Main
      title="Answer 3 questions"
      subtitle="Provide details to complete your request."
      // Footer
      onFlowBack={() => {
        clearDraft(requestId);
        router.push(`/dashboard/requests/${requestId}/setup`);
      }}
      primaryButtonText="Save"
      onSubmit={handleSubmit}
    >
      <div>
        <Label htmlFor="q1">Question 1</Label>
        <Input id="q1" value={q1} onChange={(e) => setQ1(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="q2">Question 2</Label>
        <Input id="q2" value={q2} onChange={(e) => setQ2(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="q3">Question 3</Label>
        <Input id="q3" value={q3} onChange={(e) => setQ3(e.target.value)} />
      </div>
    </SetupLayout>
  );
}
