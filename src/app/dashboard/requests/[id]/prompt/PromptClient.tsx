"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Prompt from "./Prompt";

import { useDashboard } from "@/lib/dashboard/AdminProvider";
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
  const { updateActive, promoteToActive, demoteToDraft, deleteRequest } =
    useRequestActions();
  const existing = useMemo(
    () => getRequest(requestId),
    [getRequest, requestId]
  );
  const status = existing?.status ?? "draft";

  const [errors, setErrors] = useState<{ prompt?: string; customer?: string }>(
    {}
  );

  const didHydrateFromFirestore = React.useRef(false);

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

  // const handleSubmit = async (): Promise<void> => {
  //   if (!validate()) return;
  //   if (!uid) {
  //     alert("No Firebase user yet — please wait a moment and try again.");
  //     return;
  //   }
  //   await updateActive(uid, requestId, {
  //     prompt: prompt,
  //     promptRich: promptRich,
  //     customer: customer,
  //     refineJson: "",
  //   });

  //   const promptText = promptRich ? lexicalToPlainText(promptRich) : prompt;

  //   fetch("/api/refine", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       text: promptText.trim(),
  //       requestId,
  //       uid: uid,
  //     }),
  //   })
  //     .then(async (res) => {
  //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //       const data = (await res.json()) as {
  //         refineJson?: string;
  //         refineItems?: { question: string; answer: string }[];
  //         serverUpdated?: boolean;
  //       };
  //       const refineJson =
  //         data.refineJson ?? JSON.stringify(data.refineItems ?? [], null, 0);
  //       if (data.serverUpdated) return; // backend already saved
  //       await updateActive(uid, requestId, {
  //         refineJson: refineJson,
  //       });
  //     })
  //     .catch(async (err) => {
  //       console.error("Refine request failed", err);
  //     });

  //   // 👉 Now go to Schedule step
  //   router.push(`/dashboard/requests/${requestId}/schedule?mode=${mode}`);
  // };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    if (!uid) {
      alert("No Firebase user yet — please wait a moment and try again.");
      return;
    }

    await updateActive(uid, requestId, {
      prompt,
      promptRich,
      customer,
      refineJson: mode === "create" ? "" : existing?.refineJson ?? "",
    });

    if (mode === "create") {
      const promptText = promptRich ? lexicalToPlainText(promptRich) : prompt;

      fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: promptText.trim(), requestId, uid }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as {
            refineJson?: string;
            refineItems?: { question: string; answer: string }[];
            serverUpdated?: boolean;
          };
          const refineJson =
            data.refineJson ?? JSON.stringify(data.refineItems ?? [], null, 0);
          if (!data.serverUpdated) {
            await updateActive(uid, requestId, { refineJson });
          }
        })
        .catch((err) => console.error("Refine request failed", err));

      router.push(`/dashboard/requests/${requestId}/schedule?mode=${mode}`);
    } else {
      // ✅ For edit / editDraft, skip API and go straight to schedule
      router.push(`/dashboard/requests/${requestId}/schedule?mode=${mode}`);
    }
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
