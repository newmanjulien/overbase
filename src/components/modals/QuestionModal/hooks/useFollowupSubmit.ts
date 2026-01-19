"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import type { Id } from "@/lib/questions";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
  ConnectorReference,
} from "../../types";

interface UseFollowupSubmitProps {
  threadId: Id<"questions">;
  question: string;
  visibility: "Private" | "Team";
  kpis: KpiAttachment[];
  people: PersonAttachmentWithInfo[];
  fileAttachments: FileAttachmentForUpload[];
  connectors: ConnectorReference[];
  onClose: () => void;
  // Optional callback similar to question submit, though often less used for followups
  onFollowupCreated?: () => void;
}

export function useFollowupSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAnswer = useMutation(
    api.features.questions.mutations.createAnswer,
  );

  const submitFollowup = async ({
    threadId,
    question,
    visibility,
    kpis,
    people,
    fileAttachments,
    connectors,
    onClose,
    onFollowupCreated,
  }: UseFollowupSubmitProps) => {
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createAnswer({
        questionThreadId: threadId,
        sender: "user",
        content: question.trim(),
        privacy: visibility === "Team" ? "team" : undefined,
        attachedKpis: kpis.length > 0 ? kpis : undefined,
        attachedPeople:
          people.length > 0
            ? people.map((p) => ({ id: p.name, name: p.name }))
            : undefined,
        attachedFiles:
          fileAttachments.length > 0
            ? fileAttachments.map((f) => ({
                fileName: f.fileName,
                context: f.context || undefined,
              }))
            : undefined,
        attachedConnectors:
          connectors.length > 0
            ? connectors.map((c) => ({
                id: c.id,
                title: c.title,
                logo: c.logo,
              }))
            : undefined,
      });

      onClose();
      onFollowupCreated?.();
    } catch (error) {
      console.error("Failed to create follow-up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitFollowup,
  };
}
