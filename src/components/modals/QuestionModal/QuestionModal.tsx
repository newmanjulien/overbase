"use client";

import { useQuestionModalState } from "./useQuestionModalState";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Repeat, ChevronDown } from "lucide-react";
import { formatScheduleDisplay } from "@/lib/questions";
import { QuestionModalInput } from "./components/QuestionModalInput";
import { QuestionModalActions } from "./components/QuestionModalActions";
import { useQuestionSubmit } from "./hooks/useQuestionSubmit";

export default function QuestionModal({
  isOpen,
  onClose,
  initialTab = "one",
  initialQuestion = "",
  onQuestionCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "one" | "recurring";
  initialQuestion?: string;
  onQuestionCreated?: () => void;
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
    removeConnector,
    connectors,
    setConnectors,
    schedule,
    setSchedule,
    visibility,
    setVisibility,
  } = useQuestionModalState({ isOpen, initialTab, initialQuestion });

  const { isSubmitting, submitQuestion } = useQuestionSubmit();

  const handleSubmit = () => {
    submitQuestion({
      question,
      activeTab,
      schedule,
      visibility,
      kpis,
      people,
      fileAttachments,
      connectors,
      onClose,
      onQuestionCreated,
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="full" className="flex flex-col p-0 gap-0">
        <DialogTitle className="sr-only">Ask a Question</DialogTitle>
        {/* Top header area - always present for consistent layout */}
        <div className="relative h-14 px-4 flex items-center justify-center">
          {activeTab === "recurring" && (
            <button
              onClick={() => setActiveNestedModal("schedule")}
              className="flex items-center gap-2 px-2 py-1 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Repeat className="h-4 w-4" />
              <span>
                {schedule ? formatScheduleDisplay(schedule) : "Schedule"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "one" | "recurring")}
          className="w-full"
        >
          <TabsList variant="underline" className="w-full grid grid-cols-2">
            <TabsTrigger variant="underline" value="one">
              One Time
            </TabsTrigger>
            <TabsTrigger variant="underline" value="recurring">
              Recurring
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main content */}
        <QuestionModalInput
          question={question}
          setQuestion={setQuestion}
          visibility={visibility}
          setVisibility={setVisibility}
          kpis={kpis}
          people={people}
          fileAttachments={fileAttachments}
          connectors={connectors}
          removeKpi={removeKpi}
          removePeople={removePeople}
          removeFileAttachment={removeFileAttachment}
          removeConnector={removeConnector}
        />

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
          connectors={connectors}
          setConnectors={setConnectors}
          setSchedule={setSchedule}
          isQuestionEmpty={!question.trim()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          activeTab={activeTab}
          schedule={schedule}
        />
      </DialogContent>
    </Dialog>
  );
}
