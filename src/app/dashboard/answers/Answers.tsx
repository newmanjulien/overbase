import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";
import ForwardModal from "@/components/modals/ForwardModal/ForwardModal";
import AskBar, { ModalOptions } from "@/components/bars/AskBar";
import Sidebar from "@/components/blocks/Sidebar";
import QuestionCard, { QuestionType } from "./QuestionCard";

interface AnswersProps {
  // Category state
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  categories: { key: string; name: string }[];

  // Question modal state
  showAddQuestion: boolean;
  onCloseAddQuestion: () => void;
  modalOptions: ModalOptions;
  onOpenModal: (options?: ModalOptions) => void;

  // Forward modal state
  isForwardModalOpen: boolean;
  onCloseForwardModal: () => void;
  forwardPeople: any[];
  setForwardPeople: (people: any[]) => void;

  // Questions data
  questions: QuestionType[];
  privacyMap: Record<number, "private" | "team">;
  onPrivacyChange: (questionId: number, newPrivacy: "private" | "team") => void;
  onForward: () => void;
}

export function Answers({
  activeCategory,
  setActiveCategory,
  categories,
  showAddQuestion,
  onCloseAddQuestion,
  modalOptions,
  onOpenModal,
  isForwardModalOpen,
  onCloseForwardModal,
  forwardPeople,
  setForwardPeople,
  questions,
  privacyMap,
  onPrivacyChange,
  onForward,
}: AnswersProps) {
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
            selectedTag={activeCategory || categories[0]?.name || ""}
            setSelectedTag={setActiveCategory}
            tagsConfig={categories}
          />
        </aside>

        <main className="flex-1 max-w-4xl">
          <AskBar onClick={onOpenModal} disabledButtons={["Quick"]} />

          {/* Posts */}
          <div className="space-y-3 mb-8">
            {questions.map((question: QuestionType) => (
              <QuestionCard
                key={question.id}
                question={{
                  ...question,
                  privacy: privacyMap[question.id] || question.privacy,
                }}
                onPrivacyChange={onPrivacyChange}
                onForward={onForward}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
