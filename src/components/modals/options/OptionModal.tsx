"use client";

import PeopleModal from "./PeopleModal/PeopleModal";
import ConnectorModal from "./ConnectorModal/ConnectorModal";
import FileModal from "./FileModal/FileModal";
import KpiModal from "./KpiModal/KpiModal";
import ScheduleModal from "./ScheduleModal/ScheduleModal";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
  ConnectorReference,
} from "../types";
import type { SchedulePattern } from "@/lib/questions";

export type OptionModalType =
  | "kpi"
  | "people"
  | "file"
  | "schedule"
  | "connector"
  | null;

interface OptionModalProps {
  type: OptionModalType;
  isOpen: boolean;
  onClose: () => void;
  // Kpi props
  kpis: KpiAttachment[];
  setKpis: (kpis: KpiAttachment[]) => void;
  // People props
  people: PersonAttachmentWithInfo[];
  setPeople: (people: PersonAttachmentWithInfo[]) => void;
  // File props
  fileAttachments: FileAttachmentForUpload[];
  setFileAttachments: (files: FileAttachmentForUpload[]) => void;
  // Connector props
  connectors: ConnectorReference[];
  setConnectors: (connectors: ConnectorReference[]) => void;
  // Schedule props
  onSaveSchedule?: (schedule: SchedulePattern) => void;
}

export function OptionModal({
  type,
  isOpen,
  onClose,
  kpis,
  setKpis,
  people,
  setPeople,
  fileAttachments,
  setFileAttachments,
  connectors,
  setConnectors,
  onSaveSchedule,
}: OptionModalProps) {
  if (!isOpen || !type) return null;

  switch (type) {
    case "people":
      return (
        <PeopleModal
          isOpen={isOpen}
          onClose={onClose}
          people={people}
          setPeople={setPeople}
        />
      );
    case "connector":
      return (
        <ConnectorModal
          isOpen={isOpen}
          onClose={onClose}
          connectors={connectors}
          setConnectors={setConnectors}
        />
      );
    case "file":
      return (
        <FileModal
          isOpen={isOpen}
          onClose={onClose}
          fileAttachments={fileAttachments}
          setFileAttachments={setFileAttachments}
        />
      );
    case "kpi":
      return (
        <KpiModal
          isOpen={isOpen}
          onClose={onClose}
          kpis={kpis}
          setKpis={setKpis}
        />
      );
    case "schedule":
      if (!onSaveSchedule) return null;
      return (
        <ScheduleModal
          isOpen={isOpen}
          onClose={onClose}
          onSave={onSaveSchedule}
        />
      );
    default:
      return null;
  }
}
