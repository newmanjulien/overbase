"use client";

import { useState } from "react";
import KpiModal from "./KpiModal";
import ColleagueModal from "./ColleagueModal";
import FileModal from "./FileModal";
import {
  X,
  BarChart3,
  Users,
  Upload,
  ChevronDown,
  Play,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddQuestionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [activeNestedModal, setActiveNestedModal] = useState<
    "kpi" | "colleague" | "file" | null
  >(null);
  const [kpis, setKpis] = useState<any[]>([]);
  const [colleagues, setColleagues] = useState<any[]>([]);
  const [fileAttachments, setFileAttachments] = useState<any[]>([]);

  const closeNestedModal = () => setActiveNestedModal(null);

  const removeKpi = (i: number) => setKpis(kpis.filter((_, idx) => idx !== i));
  const removeColleague = (i: number) =>
    setColleagues(colleagues.filter((_, idx) => idx !== i));
  const removeFileAttachment = (i: number) =>
    setFileAttachments(fileAttachments.filter((_, idx) => idx !== i));

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-question-modal-title"
      className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16 overflow-y-auto"
    >
      <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl my-8">
        {/* Top close button */}
        <div className="p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            aria-label="Close add question modal"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Avatar + Visibility */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 overflow-hidden"
              aria-hidden="true"
            >
              <img
                src="/professional-woman-avatar.png"
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <Play
              className="h-4 w-4 text-gray-400 fill-gray-400"
              aria-hidden="true"
            />
            <button
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
              aria-label="Select question visibility"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>Public</span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            id="add-question-modal-title"
            placeholder='Start your question with "What", "How", "Why", etc.'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full h-77 text-lg text-gray-700 placeholder:text-gray-400 border-0 resize-none focus:outline-none focus:ring-0"
            aria-label="Type your question here"
          />

          {/* Chips for KPIs / Colleagues / Files */}
          {(kpis.length > 0 ||
            colleagues.length > 0 ||
            fileAttachments.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-800"
                  role="group"
                  aria-label={`KPI: ${kpi.metric}`}
                >
                  <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="max-w-[200px] truncate">{kpi.metric}</span>
                  <button
                    onClick={() => removeKpi(idx)}
                    aria-label={`Remove KPI ${kpi.metric}`}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {colleagues.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full text-sm text-violet-800"
                  role="group"
                  aria-label={`Colleague: ${c.name}`}
                >
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="max-w-[200px] truncate">{c.name}</span>
                  <button
                    onClick={() => removeColleague(idx)}
                    aria-label={`Remove colleague ${c.name}`}
                    className="text-violet-600 hover:text-violet-800"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {fileAttachments.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-800"
                  role="group"
                  aria-label={`Attached file: ${f.fileName}`}
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="max-w-[200px] truncate">{f.fileName}</span>
                  <button
                    onClick={() => removeFileAttachment(idx)}
                    aria-label={`Remove attached file ${f.fileName}`}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveNestedModal("kpi")}
              title="Define KPIs/Metrics"
              aria-label="Open KPI modal"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <BarChart3
                className="h-5 w-5 text-gray-500 hover:text-gray-700"
                aria-hidden="true"
              />
            </button>
            <button
              onClick={() => setActiveNestedModal("colleague")}
              title="Link Colleague"
              aria-label="Open colleague modal"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users
                className="h-5 w-5 text-gray-500 hover:text-gray-700"
                aria-hidden="true"
              />
            </button>
            <button
              onClick={() => setActiveNestedModal("file")}
              title="Attach File"
              aria-label="Open file attachment modal"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Upload
                className="h-5 w-5 text-gray-500 hover:text-gray-700"
                aria-hidden="true"
              />
            </button>
          </div>
          <Button
            aria-label="Post question"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Post
          </Button>
        </div>

        {/* Nested Modals */}
        <KpiModal
          isOpen={activeNestedModal === "kpi"}
          onClose={closeNestedModal}
          kpis={kpis}
          setKpis={setKpis}
        />
        <ColleagueModal
          isOpen={activeNestedModal === "colleague"}
          onClose={closeNestedModal}
          colleagues={colleagues}
          setColleagues={setColleagues}
        />
        <FileModal
          isOpen={activeNestedModal === "file"}
          onClose={closeNestedModal}
          fileAttachments={fileAttachments}
          setFileAttachments={setFileAttachments}
        />
      </div>
    </div>
  );
}
