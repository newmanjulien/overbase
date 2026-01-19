"use client";

import { useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ModalOptions } from "@/components/bars/AskBar";
import { Questions } from "./Questions";
import {
  FILTER,
  FILTER_OPTIONS,
  isValidFilter,
  type FilterKey,
  type Privacy,
  type Id,
} from "@/lib/questions";
import type { ForwardEntry } from "@/components/modals/types";

export default function QuestionsClient() {
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>(
    FILTER_OPTIONS[0].key,
  );

  // Use paginated query with server-side filter
  const {
    results: questions,
    status: loadMoreStatus,
    loadMore,
  } = usePaginatedQuery(
    api.features.questions.queries.getAllQuestions,
    { filter: selectedFilter },
    { initialNumItems: 10 },
  );

  const updateQuestionPrivacy = useMutation(
    api.features.questions.mutations.updateQuestionPrivacy,
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
    newPrivacy: Privacy,
  ) => {
    await updateQuestionPrivacy({ id: questionId, privacy: newPrivacy });
  };

  const isLoading = questions === undefined;

  return (
    <Questions
      questions={questions ?? []}
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
      onLoadMore={() => loadMore(10)}
      loadMoreStatus={loadMoreStatus}
    />
  );
}
