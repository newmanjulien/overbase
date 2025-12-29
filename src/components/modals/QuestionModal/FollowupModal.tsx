"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuestionModalState } from "./useQuestionModalState";
import { QuestionModalInput } from "./components/QuestionModalInput";
import { QuestionModalActions } from "./components/QuestionModalActions";
import { useFollowupSubmit } from "./hooks/useFollowupSubmit";
import type { Id } from "@/lib/questions";

interface FollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: Id<"questions">;
}

export default function FollowupModal({
  isOpen,
  onClose,
  threadId,
}: FollowupModalProps) {
  const {
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
    visibility,
    setVisibility,
  } = useQuestionModalState({ isOpen });

  const { isSubmitting, submitFollowup } = useFollowupSubmit();

  const handleSubmit = () => {
    submitFollowup({
      threadId,
      question,
      visibility,
      kpis,
      people,
      fileAttachments,
      connectors,
      onClose,
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="full" className="flex flex-col p-0 gap-0">
        <DialogTitle className="sr-only">Ask a Follow-up Question</DialogTitle>
        {/* Main content - Added pt-8 to clear the close button */}
        <div className="pt-8 flex-1 flex flex-col">
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
            placeholder="Ask a follow up question..."
            autoFocus={true}
          />
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
          connectors={connectors}
          setConnectors={setConnectors}
          isQuestionEmpty={!question.trim()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
