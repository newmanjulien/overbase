"use client";

import { useMemo } from "react";
import SetupLayout from "@/components/layouts/SetupLayout";
import { Questions } from "./Questions";

const CONNECTORS = [
  { id: "slack", name: "Slack", logo: "/images/slack.png" },
  { id: "docusign", name: "Docusign", logo: "/images/docusign.png" },
  { id: "gmail", name: "Gmail", logo: "/images/gmail.png" },
  { id: "salesforce", name: "Salesforce", logo: "/images/salesforce.png" },
];

interface ConfirmProps {
  summary: string;
  setSummary: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  onBack: () => void | Promise<void>;
  onHome: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  status: "draft" | "active";
  setStatus?: (val: "draft" | "active") => void;
  mode: "create" | "edit" | "editDraft";
  infoMessage?: string | null;
}

export default function Confirm({
  summary,
  setSummary,
  onSubmit,
  onBack,
  onHome,
  onDelete,
  status,
  setStatus,
  mode,
  infoMessage,
}: ConfirmProps) {
  // Parse summary into questions array
  const questions = useMemo(() => {
    try {
      const parsed = JSON.parse(summary) as Array<{
        question: string;
        answer: string;
      }>;

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [];
      }

      return parsed.map((item, index) => ({
        id: `question-${index}`,
        question: item.question,
        answer: item.answer,
      }));
    } catch {
      return [];
    }
  }, [summary]);

  // Handle answer changes
  const handleAnswerChange = (questionId: string, newAnswer: string) => {
    const questionIndex = parseInt(questionId.replace('question-', ''));
    const updatedQuestions = [...questions];

    if (updatedQuestions[questionIndex]) {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answer: newAnswer,
      };

      // Update summary JSON
      const summaryData = updatedQuestions.map(q => ({
        question: q.question,
        answer: q.answer,
      }));
      setSummary(JSON.stringify(summaryData, null, 0));
    }
  };

  return (
    <SetupLayout
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Edit this summary of your request"
      {...(mode !== "create" &&
        setStatus && {
          sidebarActionText: "Delete request",
          onSidebarAction: onDelete,
          toggleValue: status,
          onToggleChange: (val) => void setStatus(val as "draft" | "active"),
          toggleOptions: [
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
          ],
        })}
      title="Did we understand correctly?"
      subtitle="This is a summary of what we understood from your request. Click edit if something is wrong"
      primaryButtonText="Done"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Restart"
      onSecondaryAction={onBack}
    >
      <div>
        {infoMessage && (
          <p className="text-sm text-muted-foreground mb-3">{infoMessage}</p>
        )}
        <Questions
          questions={questions}
          mentionOptions={CONNECTORS}
          placeholder="Type your answer here..."
          onAnswerChange={handleAnswerChange}
        />
      </div>
    </SetupLayout>
  );
}
