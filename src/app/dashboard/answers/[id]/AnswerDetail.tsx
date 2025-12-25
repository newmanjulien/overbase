import FollowupBar from "@/components/bars/FollowupBar";
import { InfoCard } from "@/components/blocks/InfoCard";
import AnswerCard from "./AnswerCard";
import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";
import ForwardModal from "@/components/modals/ForwardModal/ForwardModal";
import { ModalOptions } from "@/components/bars/AskBar";
import type { QuestionVariant, Answer } from "../types";
import type { Id } from "@convex/_generated/dataModel";
import type { ForwardEntry } from "@/components/modals/shared/modalTypes";

interface AnswerDetailProps {
  // Data
  question?: QuestionVariant;
  answers: Answer[];
  showFollowupBar: boolean;
  infoCard?: {
    text: string;
    href?: string;
    linkText?: string;
  };
  isLoading: boolean;

  // Question modal state
  showModal: boolean;
  onCloseModal: () => void;
  modalOptions: ModalOptions;
  onOpenModal: (options: ModalOptions) => void;

  // Forward modal state
  isForwardModalOpen: boolean;
  onCloseForwardModal: () => void;
  forwardPeople: ForwardEntry[];
  setForwardPeople: (people: ForwardEntry[]) => void;

  // Actions
  onPrivacyChange: (
    answerId: Id<"answers">,
    newPrivacy: "private" | "team"
  ) => void;
  onQuestionPrivacyChange: (newPrivacy: "private" | "team") => void;
  onForward: () => void;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnswerDetail({
  question,
  answers,
  showFollowupBar,
  infoCard,
  isLoading,
  showModal,
  onCloseModal,
  modalOptions,
  onOpenModal,
  isForwardModalOpen,
  onCloseForwardModal,
  forwardPeople,
  setForwardPeople,
  onPrivacyChange,
  onQuestionPrivacyChange,
  onForward,
}: AnswerDetailProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-full w-full">
      <QuestionModal
        isOpen={showModal}
        onClose={onCloseModal}
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

      <div className="max-w-5xl mx-auto py-8">
        <div className="space-y-2">
          {/* Original question as first card */}
          {question && (
            <AnswerCard
              topLabel="You asked"
              subLabel={question.askedDate}
              content={question.content}
              privacy={question.displayPrivacy}
              onPrivacyChange={(newPrivacy) =>
                onQuestionPrivacyChange(newPrivacy)
              }
              onForward={onForward}
              isQuestion
            />
          )}

          {/* Answer thread */}
          {answers.map((answer) => (
            <AnswerCard
              key={answer._id}
              answerId={answer._id}
              topLabel={answer.topLabel}
              content={answer.content}
              tableData={answer.tableData}
              privacy={answer.privacy}
              onPrivacyChange={(newPrivacy) =>
                onPrivacyChange(answer._id, newPrivacy)
              }
              onForward={onForward}
            />
          ))}

          {/* Placeholder card when Overbase is working on an answer */}
          {question?.status === "in-progress" && answers.length === 0 && (
            <AnswerCard
              topLabel="Overbase is answering..."
              onForward={onForward}
            />
          )}

          {showFollowupBar && <FollowupBar onClick={onOpenModal} />}

          {infoCard && (
            <div className="pt-1">
              <InfoCard
                text={infoCard.text}
                href={infoCard.href}
                linkText={infoCard.linkText}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
