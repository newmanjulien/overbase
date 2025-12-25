"use client";

import { useQuestionModalState } from "./useQuestionModalState";
import { QuestionModalActions } from "./QuestionModalActions";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { BASE_QUESTION_TAGS } from "@convex/shared/constants";
import {
  X,
  BarChart3,
  Users,
  ChevronDown,
  Play,
  FileText,
  Repeat,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AttachmentChip } from "../shared/AttachmentChip";
import Image from "next/image";

export default function QuestionModal({
  isOpen,
  onClose,
  initialTab = "one",
  showTabs = true,
  placeholder = 'Start your question with "What", "How", "Why", etc.',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "one" | "recurring";
  showTabs?: boolean;
  placeholder?: string;
}) {
  const {
    activeTab,
    setActiveTab,
    question,
    setQuestion,
    activeNestedModal,
    setActiveNestedModal,
    kpis,
    setKpis,
    people,
    setPeople,
    fileAttachments,
    setFileAttachments,
    closeNestedModal,
    removeKpi,
    removePeople,
    removeFileAttachment,
    schedule,
    setSchedule,
  } = useQuestionModalState({ isOpen, initialTab });

  const [visibility, setVisibility] = useState<"Private" | "Team">("Private");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createQuestion = useMutation(api.features.answers.createQuestion);

  const handleSubmit = async () => {
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createQuestion({
        content: question.trim(),
        privacy: visibility.toLowerCase() as "private" | "team",
        tags:
          activeTab === "recurring"
            ? BASE_QUESTION_TAGS.map((t) => t.key) // All tags including "Recurring questions"
            : BASE_QUESTION_TAGS.filter(
                (t) => t.key !== "Recurring questions"
              ).map((t) => t.key),
        questionType: activeTab === "one" ? "one-time" : "recurring",
        schedule:
          activeTab === "recurring" && schedule
            ? {
                frequency: schedule,
                deliveryDate: Date.now(), // TODO: Use actual selected date
              }
            : undefined,
        attachedKpis: kpis.length > 0 ? kpis : undefined,
        attachedPeople:
          people.length > 0
            ? people.map((p) => ({ id: p.name, name: p.name })) // Map PersonAttachment to schema format
            : undefined,
        attachedFiles:
          fileAttachments.length > 0
            ? fileAttachments.map((f) => ({
                fileName: f.fileName,
                context: f.context || undefined,
              }))
            : undefined,
      });

      // Reset state and close modal
      setQuestion("");
      setVisibility("Private");
      onClose();
    } catch (error) {
      console.error("Failed to create question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-22 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl min-h-[calc(100vh-11rem)] flex flex-col">
        {/* Top header */}
        <div
          className={`relative py-4 px-4 flex items-center justify-center${
            !showTabs ? " border-b border-gray-200" : ""
          }`}
        >
          {activeTab === "recurring" && (
            <button
              onClick={() => setActiveNestedModal("schedule")}
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-2 py-1 rounded-full text-sm text-gray-700 hover:bg-gray-50"
            >
              <Repeat className="h-4 w-4" />
              <span>
                {schedule
                  ? schedule.charAt(0).toUpperCase() + schedule.slice(1)
                  : "Schedule"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="mr-auto text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        {showTabs && (
          <div className="relative flex">
            <button
              onClick={() => setActiveTab("one")}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors
      ${
        activeTab === "one"
          ? "text-gray-900"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
      }`}
            >
              One Time
            </button>

            <button
              onClick={() => setActiveTab("recurring")}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors
      ${
        activeTab === "recurring"
          ? "text-gray-900"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
      }`}
            >
              Recurring
            </button>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />

            <div
              className="absolute bottom-0 h-0.5 bg-gray-600 transition-all duration-300"
              style={{
                left: activeTab === "one" ? "0%" : "50%",
                width: "50%",
              }}
            />
          </div>
        )}

        {/* Main content */}
        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 overflow-hidden relative">
              <Image
                src="/images/gloria.png"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <Play className="h-4 w-4 text-gray-600 fill-gray-600" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50">
                  {visibility === "Private" ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  <span>{visibility}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setVisibility("Private")}>
                  <Lock className="h-4 w-4 mr-2" />
                  Private
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVisibility("Team")}>
                  <Users className="h-4 w-4 mr-2" />
                  Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <textarea
            placeholder={placeholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full flex-1 text-gray-700 placeholder:text-gray-400 border-0 resize-none focus:outline-none focus:ring-0"
          />

          {(kpis.length > 0 ||
            people.length > 0 ||
            fileAttachments.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4 max-h-20 overflow-y-auto">
              {kpis.map((kpi, idx) => (
                <AttachmentChip
                  key={`kpi-${idx}`}
                  icon={<BarChart3 className="h-3.5 w-3.5" />}
                  label={kpi.metric}
                  onRemove={() => removeKpi(idx)}
                />
              ))}
              {people.map((p, idx) => (
                <AttachmentChip
                  key={`people-${idx}`}
                  icon={<Users className="h-3.5 w-3.5" />}
                  label={p.name}
                  onRemove={() => removePeople(idx)}
                />
              ))}
              {fileAttachments.map((f, idx) => (
                <AttachmentChip
                  key={`file-${idx}`}
                  icon={<FileText className="h-3.5 w-3.5" />}
                  label={f.fileName}
                  onRemove={() => removeFileAttachment(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom action bar and nested modals */}
        <QuestionModalActions
          activeNestedModal={activeNestedModal}
          setActiveNestedModal={setActiveNestedModal}
          closeNestedModal={closeNestedModal}
          kpis={kpis}
          setKpis={setKpis}
          people={people}
          setPeople={setPeople}
          fileAttachments={fileAttachments}
          setFileAttachments={setFileAttachments}
          setSchedule={setSchedule}
          isQuestionEmpty={!question.trim()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
