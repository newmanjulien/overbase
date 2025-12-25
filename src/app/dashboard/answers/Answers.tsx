import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";
import ForwardModal from "@/components/modals/ForwardModal/ForwardModal";
import AskBar, { ModalOptions } from "@/components/bars/AskBar";
import Sidebar from "@/components/blocks/Sidebar";
import { EmptyState } from "@/components/blocks/EmptyState";
import {
  AnsweredQuestionCard,
  InProgressQuestionCard,
  RecurringQuestionCard,
} from "./QuestionCard";
import { MessageCircle } from "lucide-react";
import { BASE_QUESTION_TAGS } from "@convex/shared/constants";
import type { QuestionVariant } from "./types";
import type { Id } from "@convex/_generated/dataModel";
import type { ForwardEntry } from "@/components/modals/shared/modalTypes";

interface AnswersProps {
  // Data
  questions: QuestionVariant[];
  isLoading: boolean;

  // Tag/sidebar state
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  tagsForSidebar: { key: string; name: string }[];

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
  onPrivacyChange: (
    questionId: Id<"questions">,
    newPrivacy: "private" | "team"
  ) => void;
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

export function Answers({
  questions,
  isLoading,
  selectedTag,
  setSelectedTag,
  tagsForSidebar,
  showAddQuestion,
  onCloseAddQuestion,
  modalOptions,
  onOpenModal,
  isForwardModalOpen,
  onCloseForwardModal,
  forwardPeople,
  setForwardPeople,
  onPrivacyChange,
}: AnswersProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-full w-full">
      <QuestionModal
        isOpen={showAddQuestion}
        onClose={onCloseAddQuestion}
        initialTab={modalOptions.tab || "one"}
        showTabs={modalOptions.showTabs}
        placeholder={modalOptions.placeholder}
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
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            tagsConfig={tagsForSidebar}
          />
        </aside>

        <main className="flex-1 max-w-4xl">
          <AskBar onClick={onOpenModal} disabledButtons={["Quick"]} />

          {questions.length === 0 ? (
            (() => {
              const tagConfig = BASE_QUESTION_TAGS.find(
                (t) => t.key === selectedTag
              );
              return (
                <EmptyState
                  title={tagConfig?.emptyTitle ?? "No questions found"}
                  description={
                    tagConfig?.emptyDescription ??
                    `No questions with tag "${selectedTag}" yet.`
                  }
                  icon={MessageCircle}
                  withBorder
                  className="py-32 min-h-[600px]"
                />
              );
            })()
          ) : (
            <div className="space-y-3 mb-8">
              {questions.map((question) => {
                // Debug: log the variant to see what we're getting
                console.log("Question variant:", question.variant, question);

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
