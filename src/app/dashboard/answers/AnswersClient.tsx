"use client";

import { useState } from "react";
import { questions, categories } from "./DummyData";
import { ModalOptions } from "@/components/bars/AskBar";
import { Answers } from "./Answers";

export default function AnswersClient() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});

  // ForwardModal state
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardPeople, setForwardPeople] = useState<any[]>([]);

  // State to track privacy values for each question
  const [privacyMap, setPrivacyMap] = useState<
    Record<number, "private" | "team">
  >(() => {
    const initial: Record<number, "private" | "team"> = {};
    questions.forEach((q) => {
      initial[q.id] = q.privacy;
    });
    return initial;
  });

  const handleOpenModal = (options?: ModalOptions) => {
    setModalOptions(options || {});
    setShowAddQuestion(true);
  };

  const handlePrivacyChange = (
    questionId: number,
    newPrivacy: "private" | "team"
  ) => {
    setPrivacyMap((prev) => ({
      ...prev,
      [questionId]: newPrivacy,
    }));
  };

  // Format categories for Sidebar
  const formattedCategories = categories.map((c) => ({
    key: c.name,
    name: c.name,
  }));

  return (
    <Answers
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      categories={formattedCategories}
      showAddQuestion={showAddQuestion}
      onCloseAddQuestion={() => setShowAddQuestion(false)}
      modalOptions={modalOptions}
      onOpenModal={handleOpenModal}
      isForwardModalOpen={isForwardModalOpen}
      onCloseForwardModal={() => setIsForwardModalOpen(false)}
      forwardPeople={forwardPeople}
      setForwardPeople={setForwardPeople}
      questions={questions}
      privacyMap={privacyMap}
      onPrivacyChange={handlePrivacyChange}
      onForward={() => setIsForwardModalOpen(true)}
    />
  );
}
