"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RequestItem } from "../../Client";
import QuestionsUI from "./Questions";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

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

interface QuestionsClientProps {
  requestId: string;
}

export default function QuestionsClient({ requestId }: QuestionsClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");

  // Load existing Firestore doc or draft
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "requests", requestId);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.q1) setQ1(data.q1);
        if (data.q2) setQ2(data.q2);
        if (data.q3) setQ3(data.q3);
      } else {
        const draft = getDraft<any>(requestId);
        if (draft) {
          if (draft.q1) setQ1(draft.q1);
          if (draft.q2) setQ2(draft.q2);
          if (draft.q3) setQ3(draft.q3);
        } else {
          router.push(`/dashboard/requests/${requestId}/setup`);
        }
      }
    });
  }, [user, requestId, router]);

  // Keep draft in sessionStorage
  useEffect(() => {
    const draft = getDraft<any>(requestId);
    if (draft) {
      saveDraft(requestId, {
        ...draft,
        q1,
        q2,
        q3,
      });
    }
  }, [q1, q2, q3, requestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting...", { user, requestId });

    if (!user) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }

    const draft = getDraft<{
      id: string;
      prompt: string;
      scheduledDate: string;
      q1?: string;
      q2?: string;
      q3?: string;
    }>(requestId);

    if (!draft) {
      console.warn("No draft found, redirecting back to setup.");
      router.push(`/dashboard/requests/${requestId}/setup`);
      return;
    }

    try {
      const ref = doc(db, "users", user.uid, "requests", requestId);
      await setDoc(
        ref,
        {
          prompt: draft.prompt,
          scheduledDate: new Date(draft.scheduledDate),
          q1: draft.q1 ?? q1,
          q2: draft.q2 ?? q2,
          q3: draft.q3 ?? q3,
          status: "submitted",
        },
        { merge: true }
      );
      console.log("Saved successfully.");
      clearDraft(requestId);
      router.push("/dashboard/requests");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed — check console for details.");
    }
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
