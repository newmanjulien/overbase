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
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddQuestionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"one" | "recurring">("one");
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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl my-8">
        {/* Top header */}
        <div className="relative py-4 px-4 flex items-center justify-center">
          {activeTab === "recurring" && (
            <button className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-2 py-1 rounded-full text-sm text-gray-700 hover:bg-gray-50">
              <Repeat className="h-4 w-4" />
              <span>Schedule</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
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
            <button className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50">
              <Users className="h-4 w-4" />
              <span>Private</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <textarea
            placeholder='Start your question with "What", "How", "Why", etc.'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full h-[19rem] text-gray-700 placeholder:text-gray-400 border-0 resize-none focus:outline-none focus:ring-0"
          />

          {(kpis.length > 0 ||
            colleagues.length > 0 ||
            fileAttachments.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-800"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="max-w-[200px] truncate">{kpi.metric}</span>
                  <button
                    onClick={() => removeKpi(idx)}
                    className="text-gray-800 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {colleagues.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-800"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span className="max-w-[200px] truncate">{c.name}</span>
                  <button
                    onClick={() => removeColleague(idx)}
                    className="text-gray-800 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {fileAttachments.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-800"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="max-w-[200px] truncate">{f.fileName}</span>
                  <button
                    onClick={() => removeFileAttachment(idx)}
                    className="text-gray-800 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
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
              onClick={() => setActiveNestedModal("colleague")}
              title="Link Colleague"
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
          <Button className="bg-gray-800 text-white hover:bg-gray-700">
            Submit
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
