import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";
import ForwardModal from "@/components/modals/ForwardModal/ForwardModal";
import AskBar, { ModalOptions } from "@/components/bars/AskBar";
import Sidebar from "@/components/blocks/Sidebar";
import { EmptyState } from "@/components/blocks/EmptyState";
import {
  AnsweredQuestionCard,
  InProgressQuestionCard,
  RecurringQuestionCard,
} from "@/components/cards/QuestionCard";
import { MessageCircle } from "lucide-react";
import type { QuestionVariant, Privacy, FilterKey, Id } from "@/lib/questions";
import type { ForwardEntry } from "@/components/modals/types";

interface QuestionsProps {
  // Data
  questions: QuestionVariant[];
  isLoading: boolean;

  // Filter/sidebar state (renamed from tag)
  selectedFilter: FilterKey;
  setSelectedFilter: (filter: string) => void;
  filterOptions: { key: string; name: string }[];

  // Question modal state
  showAddQuestion: boolean;
  onCloseAddQuestion: () => void;
  modalOptions: ModalOptions;
  onOpenModal: (options?: ModalOptions) => void;

  // Forward modal state
  isForwardModalOpen: boolean;
  onCloseForwardModal: () => void;
  forwardPeople: ForwardEntry[];
  setForwardPeople: (people: ForwardEntry[]) => void;

  // Actions
  onPrivacyChange: (questionId: Id<"questions">, newPrivacy: Privacy) => void;
}

function LoadingSkeleton() {
  return (
    <div className="h-full w-full">
      <div className="flex max-w-7xl py-8 mx-auto">
        {/* Sidebar skeleton */}
        <aside className="pr-13 sticky top-16">
          <div className="w-48 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </aside>

        {/* Content skeleton */}
        <main className="flex-1 max-w-4xl">
          {/* AskBar skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 h-24 animate-pulse" />

          {/* Question cards skeleton */}
          <div className="space-y-3 mb-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export function Questions({
  questions,
  isLoading,
  selectedFilter,
  setSelectedFilter,
  filterOptions,
  showAddQuestion,
  onCloseAddQuestion,
  modalOptions,
  onOpenModal,
  isForwardModalOpen,
  onCloseForwardModal,
  forwardPeople,
  setForwardPeople,
  onPrivacyChange,
}: QuestionsProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-full w-full">
      <QuestionModal
        isOpen={showAddQuestion}
        onClose={onCloseAddQuestion}
        initialTab={modalOptions.tab || "one"}
      />

      <ForwardModal
        isOpen={isForwardModalOpen}
        onClose={onCloseForwardModal}
        people={forwardPeople}
        setPeople={setForwardPeople}
      />

      <div className="flex max-w-7xl py-8 mx-auto">
        <aside className="pr-13 sticky top-16">
          <Sidebar
            selectedTag={selectedFilter}
            setSelectedTag={setSelectedFilter}
            tagsConfig={filterOptions}
          />
        </aside>

        <main className="flex-1 max-w-4xl">
          <AskBar onClick={onOpenModal} disabledButtons={["Quick"]} />

          {questions.length === 0 ? (
            <EmptyState
              title="No questions found"
              description="Ask your first question to get started"
              icon={MessageCircle}
              withBorder
              className="py-32 min-h-[600px]"
            />
          ) : (
            <div className="space-y-3 mb-8">
              {questions.map((question) => {
                switch (question.variant) {
                  case "answered":
                    return (
                      <AnsweredQuestionCard
                        key={question._id}
                        question={question}
                        onPrivacyChange={onPrivacyChange}
                      />
                    );
                  case "in-progress":
                    return (
                      <InProgressQuestionCard
                        key={question._id}
                        question={question}
                        onPrivacyChange={onPrivacyChange}
                      />
                    );
                  case "recurring":
                    return (
                      <RecurringQuestionCard
                        key={question._id}
                        question={question}
                        onPrivacyChange={onPrivacyChange}
                      />
                    );
                  default: {
                    // This should never happen - TypeScript exhaustive check
                    const _exhaustive: never = question;
                    console.error("Unknown variant:", _exhaustive);
                    return null;
                  }
                }
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
