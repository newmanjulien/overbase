"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ModalOptions } from "@/components/bars/AskBar";
import { Answer } from "./Answer";
import type { Id } from "@convex/_generated/dataModel";
import type { ForwardEntry } from "@/components/modals/shared/modalTypes";

interface AnswerClientProps {
  id: string;
}

export default function AnswerClient({ id }: AnswerClientProps) {
  // The id from the URL is now a Convex ID string
  const questionId = id as Id<"questions">;

  const question = useQuery(api.features.questions.queries.getQuestionById, {
    id: questionId,
  });
  const rawAnswers = useQuery(
    api.features.questions.queries.getAnswersByThreadId,
    {
      questionThreadId: questionId,
    }
  );

  const updateAnswerPrivacy = useMutation(
    api.features.questions.mutations.updateAnswerPrivacy
  );
  const updateQuestionPrivacy = useMutation(
    api.features.questions.mutations.updateQuestionPrivacy
  );

  const [showModal, setShowModal] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});

  // ForwardModal state
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardPeople, setForwardPeople] = useState<ForwardEntry[]>([]);

  const handleOpenModal = (options: ModalOptions) => {
    setModalOptions(options);
    setShowModal(true);
  };

  const handlePrivacyChange = async (
    answerId: Id<"answers">,
    newPrivacy: "private" | "team"
  ) => {
    await updateAnswerPrivacy({ id: answerId, privacy: newPrivacy });
  };

  const handleQuestionPrivacyChange = async (
    newPrivacy: "private" | "team"
  ) => {
    await updateQuestionPrivacy({ id: questionId, privacy: newPrivacy });
  };

  // Loading state
  const isLoading = question === undefined || rawAnswers === undefined;

  // Not found state
  if (question === null) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Question not found</p>
        </div>
      </div>
    );
  }

  const answers = rawAnswers ?? [];

  // Determine if we should show the followup bar
  // Show it if the question is completed (has answers)
  const showFollowupBar = question?.status === "completed";

  // Show info card if question is in progress
  const infoCard =
    question?.status === "in-progress"
      ? {
          text: "It can take up to 48h for our AI agents to answer in depth and accurately",
          linkText: "See how our AI agents work",
          href: "#",
        }
      : undefined;

  return (
    <Answer
      question={question ?? undefined}
      answers={answers}
      showFollowupBar={showFollowupBar}
      infoCard={infoCard}
      isLoading={isLoading}
      showModal={showModal}
      onCloseModal={() => setShowModal(false)}
      modalOptions={modalOptions}
      onOpenModal={handleOpenModal}
      isForwardModalOpen={isForwardModalOpen}
      onCloseForwardModal={() => setIsForwardModalOpen(false)}
      forwardPeople={forwardPeople}
      setForwardPeople={setForwardPeople}
      onPrivacyChange={handlePrivacyChange}
      onQuestionPrivacyChange={handleQuestionPrivacyChange}
      onForward={() => setIsForwardModalOpen(true)}
    />
  );
}
