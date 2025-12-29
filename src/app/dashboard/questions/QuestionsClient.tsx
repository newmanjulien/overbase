"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ModalOptions } from "@/components/bars/AskBar";
import { Questions } from "./Questions";
import {
  FILTER,
  FILTER_OPTIONS,
  isValidFilter,
  type FilterKey,
  type QuestionVariant,
  type Privacy,
  type Id,
} from "@/lib/questions";
import type { ForwardEntry } from "@/components/modals/types";

/**
 * Filter questions client-side based on the selected filter.
 * This avoids redundant server queries.
 */
function filterQuestions(
  questions: QuestionVariant[],
  filter: FilterKey
): QuestionVariant[] {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  switch (filter) {
    case FILTER.ALL:
      return questions;
    case FILTER.THIS_WEEK:
      return questions.filter((q) => q.askedTimestamp >= weekAgo);
    case FILTER.THIS_MONTH:
      return questions.filter((q) => q.askedTimestamp >= monthAgo);
    case FILTER.RECURRING:
      return questions.filter((q) => q.isRecurring);
    default:
      return questions;
  }
}

export default function QuestionsClient() {
  // Single query - fetch all questions once
  const allQuestions = useQuery(api.features.questions.queries.getAllQuestions);

  const updateQuestionPrivacy = useMutation(
    api.features.questions.mutations.updateQuestionPrivacy
  );

  const [selectedFilter, setSelectedFilter] = useState<FilterKey>(
    FILTER_OPTIONS[0].key
  );
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});

  // ForwardModal state
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardPeople, setForwardPeople] = useState<ForwardEntry[]>([]);

  const handleOpenModal = (options?: ModalOptions) => {
    setModalOptions(options || {});
    setShowAddQuestion(true);
  };

  const handlePrivacyChange = async (
    questionId: Id<"questions">,
    newPrivacy: Privacy
  ) => {
    await updateQuestionPrivacy({ id: questionId, privacy: newPrivacy });
  };

  // Filter client-side (memoized for performance)
  const filteredQuestions = useMemo(
    () => filterQuestions(allQuestions ?? [], selectedFilter),
    [allQuestions, selectedFilter]
  );

  const isLoading = allQuestions === undefined;

  return (
    <Questions
      questions={filteredQuestions}
      selectedFilter={selectedFilter}
      setSelectedFilter={(filter: string) => {
        if (isValidFilter(filter)) {
          setSelectedFilter(filter);
        }
      }}
      filterOptions={FILTER_OPTIONS}
      isLoading={isLoading}
      showAddQuestion={showAddQuestion}
      onCloseAddQuestion={() => setShowAddQuestion(false)}
      modalOptions={modalOptions}
      onOpenModal={handleOpenModal}
      isForwardModalOpen={isForwardModalOpen}
      onCloseForwardModal={() => setIsForwardModalOpen(false)}
      forwardPeople={forwardPeople}
      setForwardPeople={setForwardPeople}
      onPrivacyChange={handlePrivacyChange}
    />
  );
}
