"use client";

import { useQuestionModalState } from "./useQuestionModalState";
import KpiModal from "../KpiModal";
import PeopleModal from "../PeopleModal";
import FileModal from "../FileModal";
import ScheduleModal from "../ScheduleModal";
import { useState } from "react";
import {
  X,
  BarChart3,
  Users,
  Upload,
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
import { Button } from "@/components/ui/button";
import { AttachmentChip } from "./AttachmentChip";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl my-8">
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
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 overflow-hidden">
              <img
                src="/images/gloria.png"
                alt="User avatar"
                className="h-full w-full object-cover"
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
            className="w-full h-[19rem] text-gray-700 placeholder:text-gray-400 border-0 resize-none focus:outline-none focus:ring-0"
          />

          {(kpis.length > 0 ||
            people.length > 0 ||
            fileAttachments.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {kpis.map((kpi, idx) => (
                <AttachmentChip
                  key={`kpi-${idx}`}
                  icon={<BarChart3 className="h-3.5 w-3.5" />}
                  label={kpi.metric}
                  onRemove={() => removeKpi(idx)}
                />
              ))}
              {people.map((p: any, idx: number) => (
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

        {/* Bottom action bar */}
        <div className="pr-2 pl-1 py-2 border-t border-gray-200 flex items-center justify-between">
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
          <Button className="default">Submit</Button>
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
      </div>
    </div>
  );
}
