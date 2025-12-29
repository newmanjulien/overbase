"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import type { SchedulePattern } from "@/lib/questions";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
  ConnectorReference,
} from "../../types";

interface UseQuestionSubmitProps {
  question: string;
  activeTab: "one" | "recurring";
  schedule: SchedulePattern | null;
  visibility: "Private" | "Team";
  kpis: KpiAttachment[];
  people: PersonAttachmentWithInfo[];
  fileAttachments: FileAttachmentForUpload[];
  connectors: ConnectorReference[];
  onClose: () => void;
  onQuestionCreated?: () => void;
}

export function useQuestionSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createQuestion = useMutation(
    api.features.questions.mutations.createQuestion
  );

  const submitQuestion = async ({
    question,
    activeTab,
    schedule,
    visibility,
    kpis,
    people,
    fileAttachments,
    connectors,
    onClose,
    onQuestionCreated,
  }: UseQuestionSubmitProps) => {
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createQuestion({
        content: question.trim(),
        privacy: visibility === "Team" ? "team" : undefined,
        schedule: activeTab === "recurring" && schedule ? schedule : undefined,
        attachedKpis: kpis.length > 0 ? kpis : undefined,
        attachedPeople:
          people.length > 0
            ? people.map((p) => ({ id: p.name, name: p.name })) // Map PersonAttachmentWithInfo to schema format
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
      // If parent component provided a success callback (e.g., to redirect), call it now
      onQuestionCreated?.();
    } catch (error) {
      console.error("Failed to create question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitQuestion,
  };
}
