"use client";

import { useState, useEffect } from "react";
import type { SchedulePattern } from "@/lib/questions";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
  ConnectorReference,
} from "../types";

export interface QuestionModalStateProps {
  isOpen: boolean;
  initialTab?: "one" | "recurring";
  initialQuestion?: string;
}

export function useQuestionModalState({
  isOpen,
  initialTab = "one",
  initialQuestion = "",
}: QuestionModalStateProps) {
  const [activeTab, setActiveTab] = useState<"one" | "recurring">(initialTab);
  const [question, setQuestion] = useState(initialQuestion);
  const [activeNestedModal, setActiveNestedModal] = useState<
    "kpi" | "people" | "file" | "schedule" | "connector" | null
  >(null);
  const [kpis, setKpis] = useState<KpiAttachment[]>([]);
  const [people, setPeople] = useState<PersonAttachmentWithInfo[]>([]);
  const [fileAttachments, setFileAttachments] = useState<
    FileAttachmentForUpload[]
  >([]);
  const [connectors, setConnectors] = useState<ConnectorReference[]>([]);
  // Now stores the full SchedulePattern instead of just frequency
  const [schedule, setSchedule] = useState<SchedulePattern | null>(null);
  const [visibility, setVisibility] = useState<"Private" | "Team">("Private");

  useEffect(() => {
    if (isOpen) {
      // Reset all state when modal opens
      setActiveTab(initialTab);
      setQuestion(initialQuestion);
      setActiveNestedModal(null);
      setKpis([]);
      setPeople([]);
      setFileAttachments([]);
      setConnectors([]);
      setSchedule(null);
      setVisibility("Private");
    }
  }, [isOpen, initialTab, initialQuestion]);

  const closeNestedModal = () => setActiveNestedModal(null);

  const removeKpi = (i: number) => setKpis(kpis.filter((_, idx) => idx !== i));
  const removePeople = (i: number) =>
    setPeople(people.filter((_, idx) => idx !== i));
  const removeFileAttachment = (i: number) =>
    setFileAttachments(fileAttachments.filter((_, idx) => idx !== i));
  const removeConnector = (i: number) =>
    setConnectors(connectors.filter((_, idx) => idx !== i));

  return {
    activeTab,
    setActiveTab,
    question,
    setQuestion,
    activeNestedModal,
    setActiveNestedModal,
    kpis,
    setKpis,
    people,
    setPeople,
    fileAttachments,
    setFileAttachments,
    closeNestedModal,
    removeKpi,
    removePeople,
    removeFileAttachment,
    removeConnector,
    connectors,
    setConnectors,
    schedule,
    setSchedule,
    visibility,
    setVisibility,
  };
}
