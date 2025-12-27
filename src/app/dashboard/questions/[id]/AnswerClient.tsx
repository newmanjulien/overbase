"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Answer } from "./Answer";
import type { Id } from "@convex/_generated/dataModel";
import type { ForwardEntry } from "@/components/modals/shared/modalTypes";
import type { Privacy } from "@/lib/questions";

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

  // FollowupModal state
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);

  // ForwardModal state
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardPeople, setForwardPeople] = useState<ForwardEntry[]>([]);

  const handlePrivacyChange = async (
    answerId: Id<"answers">,
    newPrivacy: Privacy
  ) => {
    await updateAnswerPrivacy({ id: answerId, privacy: newPrivacy });
  };

  const handleQuestionPrivacyChange = async (newPrivacy: Privacy) => {
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
  // Show it if the question is answered (completed)
  const showFollowupBar = question?.variant === "answered";

  return (
    <Answer
      question={question ?? undefined}
      answers={answers}
      threadId={questionId}
      showFollowupBar={showFollowupBar}
      isLoading={isLoading}
      isFollowupModalOpen={isFollowupModalOpen}
      onOpenFollowupModal={() => setIsFollowupModalOpen(true)}
      onCloseFollowupModal={() => setIsFollowupModalOpen(false)}
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
