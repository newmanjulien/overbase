"use client";

import { useState, useEffect } from "react";
import type { SchedulePattern } from "@/lib/questions";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
} from "../shared/modalTypes";

export interface QuestionModalStateProps {
  isOpen: boolean;
  initialTab?: "one" | "recurring";
}

export function useQuestionModalState({
  isOpen,
  initialTab = "one",
}: QuestionModalStateProps) {
  const [activeTab, setActiveTab] = useState<"one" | "recurring">(initialTab);
  const [question, setQuestion] = useState("");
  const [activeNestedModal, setActiveNestedModal] = useState<
    "kpi" | "people" | "file" | "schedule" | null
  >(null);
  const [kpis, setKpis] = useState<KpiAttachment[]>([]);
  const [people, setPeople] = useState<PersonAttachmentWithInfo[]>([]);
  const [fileAttachments, setFileAttachments] = useState<
    FileAttachmentForUpload[]
  >([]);
  // Now stores the full SchedulePattern instead of just frequency
  const [schedule, setSchedule] = useState<SchedulePattern | null>(null);
  const [visibility, setVisibility] = useState<"Private" | "Team">("Private");

  useEffect(() => {
    if (isOpen) {
      // Reset all state when modal opens
      setActiveTab(initialTab);
      setQuestion("");
      setActiveNestedModal(null);
      setKpis([]);
      setPeople([]);
      setFileAttachments([]);
      setSchedule(null);
      setVisibility("Private");
    }
  }, [isOpen, initialTab]);

  const closeNestedModal = () => setActiveNestedModal(null);

  const removeKpi = (i: number) => setKpis(kpis.filter((_, idx) => idx !== i));
  const removePeople = (i: number) =>
    setPeople(people.filter((_, idx) => idx !== i));
  const removeFileAttachment = (i: number) =>
    setFileAttachments(fileAttachments.filter((_, idx) => idx !== i));

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
    schedule,
    setSchedule,
    visibility,
    setVisibility,
  };
}
