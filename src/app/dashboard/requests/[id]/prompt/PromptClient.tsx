"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Prompt from "./Prompt";

import { useDashboard } from "@/lib/dashboard/DashboardProvider";
import { useRequestActions } from "@/lib/requests/hooks";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { lexicalToPlainText } from "@/lib/lexical/utils";

interface PromptClientProps {
  requestId: string;
  prefillDate?: string;
  mode: "create" | "edit" | "editDraft";
}

export default function PromptClient({ requestId, mode }: PromptClientProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [promptRich, setPromptRich] =
    useState<SerializedEditorState<SerializedLexicalNode> | null>(null);
  const [customer, setCustomer] = useState("");

  const { uid, getRequest } = useDashboard();
  const {
    loadOne,
    updateActive,
    promoteToActive,
    demoteToDraft,
    deleteRequest,
  } = useRequestActions();
  const existing = useMemo(
    () => getRequest(requestId),
    [getRequest, requestId]
  );
  const status = existing?.status ?? "draft";

  const [errors, setErrors] = useState<{ prompt?: string; customer?: string }>(
    {}
  );

  const didHydrateFromFirestore = React.useRef(false);

  useEffect(() => {
    if (!uid) return;
    if (!existing) {
      loadOne(uid, requestId).catch((err) =>
        console.error("loadOne failed", err)
      );
    }
  }, [uid, existing, requestId, loadOne]);

  // Hydrate from Firestore once
  useEffect(() => {
    if (!existing) return;
    if (!didHydrateFromFirestore.current) {
      if (existing.prompt) setPrompt(existing.prompt);
      if (existing.promptRich) setPromptRich(existing.promptRich);
      if (existing.customer) setCustomer(existing.customer);
      didHydrateFromFirestore.current = true;
    }
  }, [existing]);

  // Auto-save
  useEffect(() => {
    if (!uid) return;
    const timeout = setTimeout(() => {
      updateActive(uid, requestId, {
        prompt: prompt,
        promptRich: promptRich,
        customer: customer,
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [prompt, promptRich, customer, uid, requestId, updateActive]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!prompt?.trim()) {
      errs.prompt = "Prompt is required.";
    }
    if (!customer?.trim()) {
      errs.customer = "Customer is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    if (!uid) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }
    await updateActive(uid, requestId, {
      prompt: prompt,
      promptRich: promptRich,
      customer: customer,
      summary: "",
      summaryStatus: "pending",
    });

    const promptText = promptRich ? lexicalToPlainText(promptRich) : prompt;

    fetch("/api/summarise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: promptText.trim(),
        requestId,
        uid: uid,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          summaryJson?: string;
          summaryItems?: { question: string; answer: string }[];
          serverUpdated?: boolean;
        };
        const summaryJson =
          data.summaryJson ?? JSON.stringify(data.summaryItems ?? [], null, 0);
        if (data.serverUpdated) return; // backend already saved
        await updateActive(uid, requestId, {
          summary: summaryJson,
          summaryStatus: "ready",
        });
      })
      .catch(async (err) => {
        console.error("Summarisation request failed", err);
        await updateActive(uid, requestId, { summaryStatus: "failed" });
      });

    // 👉 Now go to Schedule step
    router.push(`/dashboard/requests/${requestId}/schedule?mode=${mode}`);
  };

  const handleCancel = async (): Promise<void> => {
    if (mode === "create") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this draft request? This will delete the draft and cannot be undone"
      );
      if (!confirmed) return;
      if (uid) {
        await deleteRequest(uid, requestId);
      }
    }
    router.push(`/dashboard/requests`);
  };

  const handleDelete = async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this request?"
    );
    if (!confirmed) return;
    if (uid) {
      await deleteRequest(uid, requestId);
    }
    router.push(`/dashboard/requests`);
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

  return (
    <Prompt
      prompt={prompt}
      promptRich={promptRich}
      customer={customer}
      errors={errors}
      setPrompt={setPrompt}
      setPromptRich={setPromptRich}
      setCustomer={setCustomer}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onHome={handleHome}
      onDelete={handleDelete}
      status={status}
      setStatus={mode !== "create" ? handleStatusChange : undefined}
      mode={mode}
    />
  );
}
