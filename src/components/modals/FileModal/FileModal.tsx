"use client";

import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { useState } from "react";
import { ModalShell } from "../shared/ModalShell";

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

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={closeModal}
      footer={
        <Button
          onClick={handleAddFile}
          disabled={!tempFile.fileName}
          variant="default"
        >
          Add File
        </Button>
      }
    >
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
                <span className="truncate max-w-xs">{tempFile.fileName}</span>
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
    </ModalShell>
  );
}
