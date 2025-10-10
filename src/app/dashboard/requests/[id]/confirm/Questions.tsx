"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import RichTextarea from "@/components/blocks/RichTextarea";

interface Question {
  id: string;
  question: string;
  answer: string;
}

interface MentionOption {
  id: string;
  name: string;
  logo?: string;
}

interface QuestionsProps {
  questions: Question[];
  mentionOptions: MentionOption[];
  placeholder: string;
  onAnswerChange: (questionId: string, answer: string) => void;
}

export function Questions({ questions, mentionOptions, placeholder, onAnswerChange }: QuestionsProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<Set<string>>(
    new Set(questions.length > 0 ? [questions[0].id] : [])
  );

  // Store initial values once to prevent re-initialization on every change
  const initialAnswers = React.useRef<Record<string, string>>({});

  React.useEffect(() => {
    questions.forEach(q => {
      if (!(q.id in initialAnswers.current)) {
        initialAnswers.current[q.id] = q.answer;
      }
    });
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
              className="p-4 cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => {
                toggleQuestion(question.id);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="space-y-1">
                    <p className="text-base font-medium text-foreground">
                      {title ?? question.question}
                    </p>
                    {details.length > 0 && (
                      <div className="space-y-1">
                        {details.map((line, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
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
                      <RichTextarea
                        key={question.id}
                        placeholder={placeholder}
                        className="text-sm border-gray-200 min-h-24"
                        initialValue={initialAnswers.current[question.id] || question.answer}
                        onChange={(text) => {
                          onAnswerChange(question.id, text);
                        }}
                        mentionOptions={mentionOptions}
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
