"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ModalOptions } from "@/components/bars/AskBar";
import { Answers } from "./Answers";
import type { QuestionVariant } from "./types";
import type { Id } from "@convex/_generated/dataModel";
import type { ForwardEntry } from "@/components/modals/shared/modalTypes";

export default function AnswersClient() {
  const rawQuestions = useQuery(api.features.answers.getAllQuestions);
  const uniqueTags = useQuery(api.features.answers.getUniqueTags);

  const updateQuestionPrivacy = useMutation(
    api.features.answers.updateQuestionPrivacy
  );

  const [selectedTag, setSelectedTag] = useState<string>("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});

  // ForwardModal state
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardPeople, setForwardPeople] = useState<ForwardEntry[]>([]);

  // Set initial selected tag once data loads
  useEffect(() => {
    if (uniqueTags && uniqueTags.length > 0 && selectedTag === "") {
      setSelectedTag(uniqueTags[0]);
    }
  }, [uniqueTags, selectedTag]);

  const handleOpenModal = (options?: ModalOptions) => {
    setModalOptions(options || {});
    setShowAddQuestion(true);
  };

  const handlePrivacyChange = async (
    questionId: Id<"questions">,
    newPrivacy: "private" | "team"
  ) => {
    await updateQuestionPrivacy({ id: questionId, privacy: newPrivacy });
  };

  // Convert tags to Sidebar format
  const tagsForSidebar = (uniqueTags ?? []).map((tag) => ({
    key: tag,
    name: tag,
  }));

  // Filter by tag - rawQuestions already typed as QuestionVariant[]
  const filteredQuestions: QuestionVariant[] = (rawQuestions ?? []).filter(
    (q) => selectedTag === "" || q.tags.includes(selectedTag)
  );

  const isLoading = rawQuestions === undefined || uniqueTags === undefined;

  return (
    <Answers
      questions={filteredQuestions}
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
      tagsForSidebar={tagsForSidebar}
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
