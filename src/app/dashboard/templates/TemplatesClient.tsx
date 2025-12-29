"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Templates } from "./Templates";
import { normalizeTemplate, type Template } from "./types";
import QuestionModal from "@/components/modals/QuestionModal/QuestionModal";

export default function TemplatesClient() {
  const router = useRouter();
  const rawTemplates = useQuery(api.features.templates.getAllTemplates);
  const uniqueTags = useQuery(api.features.templates.getUniqueTags);

  const [selectedTag, setSelectedTag] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState("");

  // Set initial selected tag once data loads
  useEffect(() => {
    if (uniqueTags && uniqueTags.length > 0 && selectedTag === "") {
      setSelectedTag(uniqueTags[0]);
    }
  }, [uniqueTags, selectedTag]);

  // Convert string tags to the format Sidebar expects
  const tagsForSidebar = (uniqueTags ?? []).map((tag) => ({
    key: tag,
    name: tag,
  }));

  // Filter templates by selected tag and normalize (validate gradients)
  const filteredTemplates: Template[] = (rawTemplates ?? [])
    .filter((t) => selectedTag && t.tags.includes(selectedTag))
    .map(normalizeTemplate);

  const isLoading = rawTemplates === undefined || uniqueTags === undefined;

  const handleUseTemplate = (content: string) => {
    setInitialQuestion(content);
    setIsModalOpen(true);
  };

  const handleQuestionCreated = () => {
    router.push("/dashboard/questions");
  };

  return (
    <>
      <Templates
        templates={filteredTemplates}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        tagsForSidebar={tagsForSidebar}
        isLoading={isLoading}
        onUseTemplate={handleUseTemplate}
      />

      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialQuestion={initialQuestion}
        onQuestionCreated={handleQuestionCreated}
      />
    </>
  );
}
