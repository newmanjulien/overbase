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
  refineJson: string;
  setRefineJson: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  onBack: () => void | Promise<void>;
  onHome: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  status: "draft" | "active";
  setStatus?: (val: "draft" | "active") => void;
  mode: "create" | "edit" | "editDraft";
  infoMessage?: string | null;
  isRefreshing?: boolean;
}

export default function Questions({
  refineJson,
  setRefineJson,
  onSubmit,
  onBack,
  onHome,
  onDelete,
  onRefresh,
  status,
  setStatus,
  mode,
  infoMessage,
  isRefreshing,
}: QuestionsProps) {
  // Parse refineJson into questions array
  const questions = useMemo(() => {
    try {
      const parsed = JSON.parse(refineJson) as Array<{
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
  }, [refineJson]);

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

      // Update refineJson
      const refineData = updatedQuestions.map((q) => ({
        question: q.question,
        answer: q.answer,
        answerRich: q.answerRich,
      }));

      setRefineJson(JSON.stringify(refineData, null, 0));
    }
  };

  return (
    <SetupLayout
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Our AI has a few optional questions"
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
      title="These questions are optional"
      subtitle="Answer only questions you feel are relevant. These come from our AI and have not been reviewed by a human"
      subtitleActionText={isRefreshing ? "Refreshing..." : "Refresh"}
      onSubtitleAction={onRefresh}
      subtitleActionProps={{
        disabled: isRefreshing,
      }}
      primaryButtonText="Done"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Restart"
      onSecondaryAction={onBack}
    >
      <div>
        {infoMessage && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">{infoMessage}</p>
          </div>
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
