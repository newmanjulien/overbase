"use client";

import { Button } from "@/components/ui/button";
import { X, Upload, FileText } from "lucide-react";
import { useState } from "react";

export default function FileModal({
  isOpen,
  onClose,
  fileAttachments,
  setFileAttachments,
}: {
  isOpen: boolean;
  onClose: () => void;
  fileAttachments: any[];
  setFileAttachments: any;
}) {
  const [tempFile, setTempFile] = useState<{
    file: File | null;
    fileName: string;
    context: string;
  }>({
    file: null,
    fileName: "",
    context: "",
  });

  const handleAddFile = () => {
    if (tempFile.fileName) {
      setFileAttachments([...fileAttachments, { ...tempFile }]);
      setTempFile({ file: null, fileName: "", context: "" });
      onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempFile({ ...tempFile, file, fileName: file.name });
    }
  };

  const closeModal = () => {
    setTempFile({ file: null, fileName: "", context: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* File input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Upload File
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-modal"
              />
              <label
                htmlFor="file-upload-modal"
                className={`flex items-center justify-center gap-2 w-full px-3 py-4 text-sm border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  tempFile.fileName
                    ? "border-gray-400 bg-gray-100 text-gray-900 font-medium"
                    : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                }`}
              >
                {tempFile.fileName ? (
                  <>
                    <FileText className="h-5 w-5" />
                    <span className="truncate max-w-xs">
                      {tempFile.fileName}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Click to select a file</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Context textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              How should this file be used?{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Provide context on what this file contains and how it should be used..."
              value={tempFile.context}
              onChange={(e) =>
                setTempFile({ ...tempFile, context: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none resize-none h-24"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <Button
            onClick={handleAddFile}
            disabled={!tempFile.fileName}
            variant="default"
          >
            Add File
          </Button>
        </div>
      </div>
    </div>
  );
}
