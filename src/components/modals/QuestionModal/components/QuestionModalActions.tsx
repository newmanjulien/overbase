"use client";

import { BarChart3, Users, Upload, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import type { SchedulePattern } from "@/lib/questions";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
  ConnectorReference,
} from "../../types";
import { OptionModal } from "../../options/OptionModal";

interface QuestionModalActionsProps {
  activeNestedModal:
    | "kpi"
    | "people"
    | "file"
    | "schedule"
    | "connector"
    | null;
  setActiveNestedModal: (
    modal: "kpi" | "people" | "file" | "schedule" | "connector" | null
  ) => void;
  closeNestedModal: () => void;
  kpis: KpiAttachment[];
  setKpis: (kpis: KpiAttachment[]) => void;
  people: PersonAttachmentWithInfo[];
  setPeople: (people: PersonAttachmentWithInfo[]) => void;
  fileAttachments: FileAttachmentForUpload[];
  setFileAttachments: (files: FileAttachmentForUpload[]) => void;
  connectors: ConnectorReference[];
  setConnectors: (connectors: ConnectorReference[]) => void;
  setSchedule?: Dispatch<SetStateAction<SchedulePattern | null>>;
  isQuestionEmpty: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  activeTab?: "one" | "recurring";
  schedule?: SchedulePattern | null;
}

export function QuestionModalActions({
  activeNestedModal,
  setActiveNestedModal,
  closeNestedModal,
  kpis,
  setKpis,
  people,
  setPeople,
  fileAttachments,
  setFileAttachments,
  connectors,
  setConnectors,
  setSchedule,
  isQuestionEmpty,
  onSubmit,
  isSubmitting,
  activeTab = "one",
  schedule = null,
}: QuestionModalActionsProps) {
  return (
    <>
      {/* Bottom action bar */}
      <div className="p-2 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveNestedModal("kpi")}
            title="Define KPIs/Metrics"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <BarChart3 className="h-4.5 w-4.5 text-gray-700 hover:text-gray-900" />
          </button>
          <button
            onClick={() => setActiveNestedModal("people")}
            title="Link People"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="h-4.5 w-4.5 text-gray-700 hover:text-gray-900" />
          </button>
          <button
            onClick={() => setActiveNestedModal("file")}
            title="Attach File"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Upload className="h-4.5 w-4.5 text-gray-700 hover:text-gray-900" />
          </button>
          <button
            onClick={() => setActiveNestedModal("connector")}
            title="Add Connectors"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plug className="h-4.5 w-4.5 text-gray-700 hover:text-gray-900" />
          </button>
        </div>
        <Button
          onClick={onSubmit}
          disabled={
            isQuestionEmpty ||
            isSubmitting ||
            (activeTab === "recurring" && !schedule)
          }
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>

      <OptionModal
        type={activeNestedModal}
        isOpen={!!activeNestedModal}
        onClose={closeNestedModal}
        kpis={kpis}
        setKpis={setKpis}
        people={people}
        setPeople={setPeople}
        fileAttachments={fileAttachments}
        setFileAttachments={setFileAttachments}
        connectors={connectors}
        setConnectors={setConnectors}
        onSaveSchedule={setSchedule}
      />
    </>
  );
}
