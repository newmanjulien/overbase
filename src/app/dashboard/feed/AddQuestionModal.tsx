"use client";

import { useState } from "react";
import KpiModal from "./KpiModal";
import ColleagueModal from "./ColleagueModal";
import FileModal from "./FileModal";
import { X, BarChart3, Users, Upload, ChevronDown, Play } from "lucide-react";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl my-8">
        <div className="p-4 border-b border-gray-200">
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            placeholder='Start your question with "What", "How", "Why", etc.'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full h-64 text-lg text-gray-700 placeholder:text-gray-400 border-0 resize-none focus:outline-none focus:ring-0"
          />
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveNestedModal("kpi")}
              title="Define KPIs/Metrics"
            >
              <BarChart3 className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
            <button
              onClick={() => setActiveNestedModal("colleague")}
              title="Link Colleague"
            >
              <Users className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
            <button
              onClick={() => setActiveNestedModal("file")}
              title="Attach File"
            >
              <Upload className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <Button className="bg-blue-500 text-white hover:bg-blue-600">
            Post
          </Button>
        </div>

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
