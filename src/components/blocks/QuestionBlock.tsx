"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import RichText from "@/components/blocks/RichText";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

interface Question {
  id: string;
  question: string;
  answer: string;
  answerRich: SerializedEditorState<SerializedLexicalNode> | null;
}

interface MentionOption {
  id: string;
  name: string;
  logo?: string;
}

interface QuestionBlockProps {
  questions: Question[];
  mentionOptions: MentionOption[];
  placeholder: string;
  onAnswerChange: (
    questionId: string,
    answer: string,
    answerRich: SerializedEditorState<SerializedLexicalNode> | null
  ) => void;
  status?: "draft" | "active";
}

export function QuestionBlock({
  questions,
  mentionOptions,
  placeholder,
  onAnswerChange,
  status,
}: QuestionBlockProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<Set<string>>(
    new Set()
  );

  // Store initial values once to prevent re-initialization on every change
  const initialAnswers = React.useRef<Record<string, string>>({});
  const hasExpandedInitially = React.useRef(false);

  React.useEffect(() => {
    questions.forEach((q) => {
      if (!(q.id in initialAnswers.current)) {
        initialAnswers.current[q.id] = q.answer;
      }
    });

    // Expand first question once when questions are first loaded
    if (questions.length > 0 && !hasExpandedInitially.current) {
      setExpandedQuestion(new Set([questions[0].id]));
      hasExpandedInitially.current = true;
    }
  }, [questions]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion((prev) => {
      const next = new Set<string>();

      // If user clicked the currently open question, close it.
      if (!prev.has(questionId)) {
        next.add(questionId);
      }

      return next;
    });
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        {questions.map((question) => {
          const isExpanded = expandedQuestion.has(question.id);
          const parts = question.question
            .split("\n")
            .map((part) => part.trim())
            .filter(Boolean);
          const [title, ...details] = parts;

          return (
            <Card
              key={question.id}
              className="p-4 cursor-pointer border-gray-200/80 hover:border-gray-300 transition-colors"
              onClick={() => {
                toggleQuestion(question.id);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {title ?? question.question}
                    </p>
                    {details.length > 0 && (
                      <div className="space-y-1">
                        {details.map((line, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div
                      className="mt-4"
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <RichText
                        key={question.id}
                        defaultText={
                          initialAnswers.current[question.id] || question.answer
                        }
                        defaultRichJSON={question.answerRich ?? null}
                        onChangeText={(text) =>
                          onAnswerChange(question.id, text, null)
                        }
                        onChangeRichJSON={(json) =>
                          onAnswerChange(question.id, "", json)
                        }
                        placeholder={placeholder}
                        mentionOptions={mentionOptions}
                        className="text-sm border-gray-200 min-h-24"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
