"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Prompt from "./Prompt";

import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/stores/useRequestStore";

interface PromptClientProps {
  requestId: string;
  prefillDate?: string;
  mode: "create" | "edit" | "editDraft";
}

export default function PromptClient({ requestId, mode }: PromptClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState<string>("");
  const [customer, setCustomer] = useState<string>("");

  const {
    requests,
    loadOne,
    updateActive,
    promoteToActive,
    demoteToDraft,
    deleteRequest,
  } = useRequestListStore();

  const [errors, setErrors] = useState<{ prompt?: string; customer?: string }>(
    {}
  );

  const didHydrateFromFirestore = React.useRef(false);

  // Load from store
  useEffect(() => {
    if (!user) return;
    loadOne(user.uid, requestId);
  }, [user, requestId, loadOne]);

  // Hydrate from Firestore once
  useEffect(() => {
    const existing = requests[requestId];
    if (!existing) return;
    if (!didHydrateFromFirestore.current) {
      if (existing.prompt) setPrompt(existing.prompt);
      if (existing.customer) setCustomer(existing.customer);
      didHydrateFromFirestore.current = true;
    }
  }, [requests, requestId]);

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

  const existing = requests[requestId];
  const status = existing?.status ?? "draft";

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    if (!user) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }
    await updateActive(user.uid, requestId, {
      prompt: prompt,
      customer: customer,
      summary: "",
      summarySourcePrompt: "",
      summaryStatus: "pending",
    });

    fetch("/api/summarise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: prompt.trim(),
        requestId,
        uid: user.uid,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          summary?: string;
          serverUpdated?: boolean;
        };
        if (data.serverUpdated) return; // backend already saved
        await updateActive(user.uid, requestId, {
          summary: data.summary ?? "",
          summarySourcePrompt: prompt,
          summaryStatus: "ready",
        });
      })
      .catch(async (err) => {
        console.error("Summarisation request failed", err);
        await updateActive(user.uid, requestId, { summaryStatus: "failed" });
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
      if (user) {
        await deleteRequest(user.uid, requestId);
      }
    }
    router.push(`/dashboard/requests`);
  };

  const handleDelete = async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this request?"
    );
    if (!confirmed) return;
    if (user) {
      await deleteRequest(user.uid, requestId);
    }
    router.push(`/dashboard/requests`);
  };

  const handleHome = async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to return to the dashboard? Your changes will be deleted."
    );
    if (!confirmed) return;
    router.push(`/dashboard/requests`);
  };

  const handleStatusChange = async (val: "draft" | "active") => {
    if (!user) return;
    if (val === "active") await promoteToActive(user.uid, requestId);
    else await demoteToDraft(user.uid, requestId);
  };

  return (
    <Prompt
      prompt={prompt}
      customer={customer}
      errors={errors}
      setPrompt={setPrompt}
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
