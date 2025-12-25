"use client";

import KpiModal from "../KpiModal/KpiModal";
import PeopleModal from "../PeopleModal/PeopleModal";
import FileModal from "../FileModal/FileModal";
import ScheduleModal, {
  RecurringFrequency,
} from "../ScheduleModal/ScheduleModal";
import { BarChart3, Users, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
} from "../shared/modalTypes";

interface QuestionModalActionsProps {
  activeNestedModal: "kpi" | "people" | "file" | "schedule" | null;
  setActiveNestedModal: (
    modal: "kpi" | "people" | "file" | "schedule" | null
  ) => void;
  closeNestedModal: () => void;
  kpis: KpiAttachment[];
  setKpis: (kpis: KpiAttachment[]) => void;
  people: PersonAttachmentWithInfo[];
  setPeople: (people: PersonAttachmentWithInfo[]) => void;
  fileAttachments: FileAttachmentForUpload[];
  setFileAttachments: (files: FileAttachmentForUpload[]) => void;
  setSchedule: Dispatch<SetStateAction<RecurringFrequency | null>>;
  isQuestionEmpty: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
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
  setSchedule,
  isQuestionEmpty,
  onSubmit,
  isSubmitting,
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
        </div>
        <Button onClick={onSubmit} disabled={isQuestionEmpty || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>

      {/* Nested Modals */}
      <KpiModal
        isOpen={activeNestedModal === "kpi"}
        onClose={closeNestedModal}
        kpis={kpis}
        setKpis={setKpis}
      />
      <PeopleModal
        isOpen={activeNestedModal === "people"}
        onClose={closeNestedModal}
        people={people}
        setPeople={setPeople}
      />
      <FileModal
        isOpen={activeNestedModal === "file"}
        onClose={closeNestedModal}
        fileAttachments={fileAttachments}
        setFileAttachments={setFileAttachments}
      />
      <ScheduleModal
        isOpen={activeNestedModal === "schedule"}
        onClose={closeNestedModal}
        onSave={setSchedule}
      />
    </>
  );
}
