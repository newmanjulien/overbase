"use client";

import { useState } from "react";
import { questions, categories } from "./DummyData";
import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";
import ForwardModal from "@/components/modals/ForwardModal";
import AskBar, { ModalOptions } from "@/components/blocks/AskBar";
import Sidebar from "@/components/blocks/Sidebar";
import QuestionCard, { QuestionType } from "./QuestionCard";

export default function AnswersPage() {
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

  return (
    <div className="h-full w-full">
      <QuestionModal
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
        initialTab={modalOptions.tab || "one"}
        showTabs={modalOptions.showTabs}
        placeholder={modalOptions.placeholder}
      />

      <ForwardModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        people={forwardPeople}
        setPeople={setForwardPeople}
      />

      <div className="flex max-w-7xl py-8 mx-auto">
        <aside className="pr-13 sticky top-16">
          <Sidebar
            selectedTag={activeCategory || categories[0]?.name || ""}
            setSelectedTag={setActiveCategory}
            tagsConfig={categories.map((c) => ({ key: c.name, name: c.name }))}
          />
        </aside>

        <main className="flex-1 max-w-4xl">
          <AskBar onClick={handleOpenModal} disabledButtons={["Quick"]} />

          {/* Posts */}
          <div className="space-y-3 mb-8">
            {questions.map((question: QuestionType) => (
              <QuestionCard
                key={question.id}
                question={{
                  ...question,
                  privacy: privacyMap[question.id] || question.privacy,
                }}
                onPrivacyChange={handlePrivacyChange}
                onForward={() => setIsForwardModalOpen(true)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
