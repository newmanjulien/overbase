"use client";

import { useState } from "react";
import { dummyAnswers, AnswerData } from "./DummyData";
import { ModalOptions } from "@/components/bars/AskBar";
import { AnswerDetail } from "./AnswerDetail";

interface AnswerDetailClientProps {
  id: string;
}

export default function AnswerDetailClient({ id }: AnswerDetailClientProps) {
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
    <AnswerDetail
      answers={answers}
      showFollowupBar={showFollowupBar}
      infoCard={infoCard}
      showModal={showModal}
      onCloseModal={() => setShowModal(false)}
      modalOptions={modalOptions}
      onOpenModal={handleOpenModal}
      isForwardModalOpen={isForwardModalOpen}
      onCloseForwardModal={() => setIsForwardModalOpen(false)}
      forwardPeople={forwardPeople}
      setForwardPeople={setForwardPeople}
      privacyMap={privacyMap}
      onPrivacyChange={handlePrivacyChange}
      onForward={() => setIsForwardModalOpen(true)}
    />
  );
}
