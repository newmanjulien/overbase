import FollowupBar from "@/components/bars/FollowupBar";
import { InfoCard } from "@/components/cards/InfoCard";
import AnswerCard from "@/components/cards/AnswerCard";
import StatusCard from "@/components/cards/StatusCard";
import FollowupModal from "@/components/modals/QuestionModal/FollowupModal";
import ForwardModal from "@/components/modals/ForwardModal/ForwardModal";
import {
  deriveThread,
  type QuestionVariant,
  type Privacy,
  type Id,
} from "@/lib/questions";
import type { Answer as AnswerType } from "../types";
import type { ForwardEntry } from "@/components/modals/types";

interface AnswerProps {
  // Data
  question?: QuestionVariant;
  answers: AnswerType[];
  threadId: Id<"questions">;
  showFollowupBar: boolean;
  isLoading: boolean;

  // Followup modal state
  isFollowupModalOpen: boolean;
  onOpenFollowupModal: () => void;
  onCloseFollowupModal: () => void;

  // Forward modal state
  isForwardModalOpen: boolean;
  onCloseForwardModal: () => void;
  forwardPeople: ForwardEntry[];
  setForwardPeople: (people: ForwardEntry[]) => void;

  // Actions
  onPrivacyChange: (answerId: Id<"answers">, newPrivacy: Privacy) => void;
  onQuestionPrivacyChange: (newPrivacy: Privacy) => void;
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

export function Answer({
  question,
  answers,
  threadId,
  showFollowupBar,
  isLoading,
  isFollowupModalOpen,
  onOpenFollowupModal,
  onCloseFollowupModal,
  isForwardModalOpen,
  onCloseForwardModal,
  forwardPeople,
  setForwardPeople,
  onPrivacyChange,
  onQuestionPrivacyChange,
  onForward,
}: AnswerProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Derive the unified thread of cards
  const thread = deriveThread(question, answers);

  return (
    <div className="h-full w-full">
      <FollowupModal
        isOpen={isFollowupModalOpen}
        onClose={onCloseFollowupModal}
        threadId={threadId}
      />

      <ForwardModal
        isOpen={isForwardModalOpen}
        onClose={onCloseForwardModal}
        people={forwardPeople}
        setPeople={setForwardPeople}
      />

      <div className="max-w-5xl mx-auto py-8">
        <div className="space-y-2">
          {/* Render thread using deriveThread - all logic centralized */}
          {thread.map((card, index) => {
            switch (card.type) {
              case "question":
                return (
                  <AnswerCard
                    key="question"
                    type="question"
                    content={card.content}
                    date={card.date}
                    privacy={card.privacy}
                    onPrivacyChange={onQuestionPrivacyChange}
                    onForward={onForward}
                    attachedKpis={card.attachedKpis}
                    attachedPeople={card.attachedPeople}
                    attachedFiles={card.attachedFiles}
                    attachedConnectors={card.attachedConnectors}
                  />
                );

              case "response":
                return (
                  <AnswerCard
                    key={card.answerId}
                    type="response"
                    answerId={card.answerId}
                    sender={card.sender}
                    content={card.content}
                    privacy={card.privacy}
                    tableData={card.tableData}
                    onPrivacyChange={(newPrivacy) =>
                      onPrivacyChange(
                        card.answerId as Id<"answers">,
                        newPrivacy
                      )
                    }
                    onForward={onForward}
                    showMenu={card.showMenu}
                    attachedKpis={card.attachedKpis}
                    attachedPeople={card.attachedPeople}
                    attachedFiles={card.attachedFiles}
                    attachedConnectors={card.attachedConnectors}
                  />
                );

              case "status":
                return (
                  <StatusCard
                    key={`status-${index}`}
                    label={card.label}
                    subLabel={card.subLabel}
                  />
                );

              case "info":
                return (
                  <div key={`info-${index}`} className="pt-1">
                    <InfoCard
                      text={card.text}
                      href={card.href}
                      linkText={card.linkText}
                    />
                  </div>
                );
            }
          })}

          {showFollowupBar && <FollowupBar onClick={onOpenFollowupModal} />}
        </div>
      </div>
    </div>
  );
}
