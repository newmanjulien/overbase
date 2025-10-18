"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Prompt from "./Prompt";

import { useDashboard } from "@/lib/dashboard/AdminProvider";
import { useRequestActions } from "@/lib/requests/hooks";
import { useRequestNavigation } from "@/lib/requests/useRequestNavigation";
import { useLexicalState } from "@/lib/lexical/useLexicalState";

interface PromptClientProps {
  requestId: string;
  prefillDate?: string;
  mode: "create" | "edit" | "editDraft";
}

export default function PromptClient({ requestId, mode }: PromptClientProps) {
  const router = useRouter();

  const [customer, setCustomer] = useState("");

  const { uid, getRequest } = useDashboard();
  const { updateActive, deleteRequest } = useRequestActions();
  const existing = useMemo(
    () => getRequest(requestId),
    [getRequest, requestId]
  );

  const { status, handleHome, handleDelete, handleStatusChange } =
    useRequestNavigation({
      requestId,
      mode,
      uid,
      existing,
    });

  const { promptRich, promptText, setPromptRich, setPromptText } =
    useLexicalState({
      initialPromptRich: existing?.promptRich,
      initialPrompt: existing?.prompt,
    });

  const [errors, setErrors] = useState<{ prompt?: string; customer?: string }>(
    {}
  );

  // Hydrate customer from Firestore once
  const didHydrateCustomer = React.useRef(false);
  useEffect(() => {
    if (!existing || didHydrateCustomer.current) return;
    if (existing.customer) {
      setCustomer(existing.customer);
    }
    didHydrateCustomer.current = true;
  }, [existing]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!promptText.trim()) {
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
      promptRich: promptRich,
      customer: customer,
      refineJson: "",
    });

    fetch("/api/refine", {
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
          refineJson?: string;
          refineItems?: { question: string; answer: string }[];
        };
        // API handles the Firestore update, client just logs success
        console.log("[PromptClient] Refine request successful");
      })
      .catch(async (err) => {
        console.error("Refine request failed", err);
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

  return (
    <Prompt
      prompt={promptText}
      promptRich={promptRich}
      customer={customer}
      errors={errors}
      setPrompt={setPromptText}
      setPromptRich={setPromptRich}
      setCustomer={setCustomer}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onHome={handleHome}
      onDelete={handleDelete}
      status={status}
      setStatus={handleStatusChange}
      mode={mode}
    />
  );
}
