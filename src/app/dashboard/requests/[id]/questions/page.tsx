"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RequestItem } from "../../Client";

const DRAFT_KEY = (id: string) => `request_draft:${id}`;

function getDraft<T = unknown>(id: string): T | null {
  const raw = window.sessionStorage.getItem(DRAFT_KEY(id));
  return raw ? (JSON.parse(raw) as T) : null;
}
function clearDraft(id: string) {
  window.sessionStorage.removeItem(DRAFT_KEY(id));
}

export default function RequestQuestionsPage() {
  const { id } = useParams();
  const requestId = Array.isArray(id) ? id[0] : id;

  if (!requestId) {
    throw new Error("Request ID is missing in route.");
  }

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
    <div className="flex min-h-screen">
      <aside className="w-96 bg-gray-100 border-r border-gray-200 px-12 pt-12 pb-6 flex flex-col">
        <Button
          onClick={() => {
            clearDraft(requestId);
            router.push("/dashboard/requests");
          }}
          variant="backLink"
          size="backLink"
          leadingIcon={<ChevronLeft className="size-5" />}
        >
          Back to requests
        </Button>
        <h2 className="mt-6 text-2xl font-semibold text-gray-900 leading-tight">
          Answer 3 short questions
        </h2>
      </aside>

      <main className="flex-1 max-w-2xl mx-auto px-10 pt-12 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex justify-between items-center border-t border-gray-200 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearDraft(requestId);
                router.push("/dashboard/requests");
              }}
            >
              Back
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
