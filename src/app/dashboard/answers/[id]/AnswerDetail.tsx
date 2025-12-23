import FollowupBar from "@/components/bars/FollowupBar";
import { InfoCard } from "@/components/blocks/InfoCard";
import AnswerCard from "./AnswerCard";
import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";
import ForwardModal from "@/components/modals/ForwardModal";
import { ModalOptions } from "@/components/bars/AskBar";
import { AnswerData } from "./DummyData";

interface AnswerDetailProps {
  // Answer data
  answers: AnswerData[];
  showFollowupBar: boolean;
  infoCard?: {
    text: string;
    href?: string;
    linkText?: string;
  };

  // Question modal state
  showModal: boolean;
  onCloseModal: () => void;
  modalOptions: ModalOptions;
  onOpenModal: (options: ModalOptions) => void;

  // Forward modal state
  isForwardModalOpen: boolean;
  onCloseForwardModal: () => void;
  forwardPeople: any[];
  setForwardPeople: (people: any[]) => void;

  // Privacy state
  privacyMap: Record<number, "private" | "team">;
  onPrivacyChange: (answerId: number, newPrivacy: "private" | "team") => void;
  onForward: () => void;
}

export function AnswerDetail({
  answers,
  showFollowupBar,
  infoCard,
  showModal,
  onCloseModal,
  modalOptions,
  onOpenModal,
  isForwardModalOpen,
  onCloseForwardModal,
  forwardPeople,
  setForwardPeople,
  privacyMap,
  onPrivacyChange,
  onForward,
}: AnswerDetailProps) {
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
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              avatar={answer.avatar}
              avatarFallback={answer.avatarFallback}
              topLabel={answer.topLabel}
              subLabel={answer.subLabel}
              tableData={answer.tableData}
              content={answer.content}
              privacy={privacyMap[answer.id] || answer.privacy}
              onPrivacyChange={(newPrivacy) =>
                onPrivacyChange(answer.id, newPrivacy)
              }
              onForward={onForward}
            />
          ))}

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
