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
      setFileAttachments([...fileAttachments, tempFile]);
      setTempFile({ file: null, fileName: "", context: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-600" />
            Attach a File
          </h3>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="File Name"
            value={tempFile.fileName}
            onChange={(e) =>
              setTempFile({ ...tempFile, fileName: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="file"
            onChange={(e) =>
              setTempFile({ ...tempFile, file: e.target.files?.[0] || null })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Context or Description"
            value={tempFile.context}
            onChange={(e) =>
              setTempFile({ ...tempFile, context: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddFile} disabled={!tempFile.fileName}>
            Attach
          </Button>
        </div>
      </div>
    </div>
  );
}
