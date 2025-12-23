"use client";

import { useState, useEffect } from "react";
import { RecurringFrequency } from "../ScheduleModal";

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
  const [kpis, setKpis] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [fileAttachments, setFileAttachments] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<RecurringFrequency | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
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
  };
}
