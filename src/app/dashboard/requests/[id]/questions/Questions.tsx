"use client";

import { useMemo } from "react";
import SetupLayout from "@/components/layouts/SetupLayout";
import { QuestionBlock } from "@/components/blocks/QuestionBlock";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

const CONNECTORS = [
  { id: "slack", name: "Slack", logo: "/images/slack.png" },
  { id: "docusign", name: "Docusign", logo: "/images/docusign.png" },
  { id: "gmail", name: "Gmail", logo: "/images/gmail.png" },
  { id: "salesforce", name: "Salesforce", logo: "/images/salesforce.png" },
];

interface QuestionsProps {
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

export default function Questions({
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
}: QuestionsProps) {
  // Parse summary into questions array
  const questions = useMemo(() => {
    try {
      const parsed = JSON.parse(summary) as Array<{
        question: string;
        answer: string;
        answerRich: SerializedEditorState<SerializedLexicalNode> | null;
      }>;

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [];
      }

      return parsed.map((item, index) => ({
        id: `question-${index}`,
        question: item.question,
        answer: item.answer,
        answerRich: item.answerRich,
      }));
    } catch {
      return [];
    }
  }, [summary]);

  // Handle answer changes
  const handleAnswerChange = (
    questionId: string,
    newAnswer: string,
    newRichJSON: SerializedEditorState<SerializedLexicalNode> | null
  ) => {
    const questionIndex = parseInt(questionId.replace("question-", ""));
    const updatedQuestions = [...questions];

    if (updatedQuestions[questionIndex]) {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answer: newAnswer || updatedQuestions[questionIndex].answer,
        answerRich: newRichJSON ?? updatedQuestions[questionIndex].answerRich,
      };

      // Update summary JSON
      const summaryData = updatedQuestions.map((q) => ({
        question: q.question,
        answer: q.answer,
        answerRich: q.answerRich,
      }));

      setSummary(JSON.stringify(summaryData, null, 0));
    }
  };

  return (
    <SetupLayout
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Answer a few optional questions"
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
      title="Optional questions"
      subtitle="We did a quick review of your request and these are optional questions which might help us complete it"
      primaryButtonText="Done"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Restart"
      onSecondaryAction={onBack}
    >
      <div>
        {infoMessage && (
          <p className="text-sm text-muted-foreground mb-3">{infoMessage}</p>
        )}
        <QuestionBlock
          questions={questions}
          mentionOptions={CONNECTORS}
          placeholder="Type your answer here..."
          onAnswerChange={handleAnswerChange}
        />
      </div>
    </SetupLayout>
  );
}
