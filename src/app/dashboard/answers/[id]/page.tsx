"use client";

import { use, useState, useRef, useEffect } from "react";
import { questions as allPosts } from "../DummyData";
import { dummyAnswers, AnswerData } from "./DummyData";
import FollowupBar from "@/components/blocks/FollowupBar";
import { InfoCard } from "@/components/blocks/InfoCard";
import AnswerCard from "./AnswerCard";
import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";
import ForwardModal from "@/components/modals/ForwardModal";
import { ModalOptions } from "@/components/blocks/AskBar";

export default function AnswerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const postId = Number(id);
  const post = allPosts.find((p) => p.id === postId);
  const detailData = dummyAnswers[postId];

  const [showModal, setShowModal] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(post?.title || "");
  const titleInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleOpenModal = (options: ModalOptions) => {
    setModalOptions(options);
    setShowModal(true);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditingTitle(false);
    } else if (e.key === "Escape") {
      setTitle(post?.title || "");
      setIsEditingTitle(false);
    }
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

  if (!post) return <div>Post not found</div>;

  const answers = detailData?.answers || [];
  const showFollowupBar = detailData?.showFollowupBar ?? true;
  const infoCard = detailData?.infoCard;

  return (
    <div className="min-h-screen bg-gray-100">
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

      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-start gap-4 mb-5 w-full">
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="text-xl text-gray-800 bg-transparent border-b border-gray-400 outline-none w-full"
              />
            ) : (
              <h1
                className="text-xl text-gray-800 cursor-pointer hover:text-gray-600"
                onClick={handleTitleClick}
              >
                {title}
              </h1>
            )}
          </div>
        </div>

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
            <div className="pt-4">
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
