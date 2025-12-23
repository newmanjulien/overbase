"use client";

import { use, useState } from "react";

import { dummyAnswers, AnswerData } from "./DummyData";
import FollowupBar from "@/components/bars/FollowupBar";
import { InfoCard } from "@/components/blocks/InfoCard";
import AnswerCard from "./AnswerCard";
import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";
import ForwardModal from "@/components/modals/ForwardModal";
import { ModalOptions } from "@/components/bars/AskBar";

export default function AnswerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const postId = Number(id);
  const detailData = dummyAnswers[postId];

  const [showModal, setShowModal] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});

  // ForwardModal state
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardPeople, setForwardPeople] = useState<any[]>([]);

  // State to track privacy values for each answer
  const [privacyMap, setPrivacyMap] = useState<
    Record<number, "private" | "team">
  >(() => {
    const initial: Record<number, "private" | "team"> = {};
    detailData?.answers.forEach((answer: AnswerData) => {
      initial[answer.id] = answer.privacy;
    });
    return initial;
  });

  const handleOpenModal = (options: ModalOptions) => {
    setModalOptions(options);
    setShowModal(true);
  };

  const handlePrivacyChange = (
    answerId: number,
    newPrivacy: "private" | "team"
  ) => {
    setPrivacyMap((prev) => ({
      ...prev,
      [answerId]: newPrivacy,
    }));
  };

  if (!detailData) return <div>Post not found</div>;

  const answers = detailData?.answers || [];
  const showFollowupBar = detailData?.showFollowupBar ?? true;
  const infoCard = detailData?.infoCard;

  return (
    <div className="h-full w-full">
      <QuestionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
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
                handlePrivacyChange(answer.id, newPrivacy)
              }
              onForward={() => setIsForwardModalOpen(true)}
            />
          ))}

          {showFollowupBar && <FollowupBar onClick={handleOpenModal} />}

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
