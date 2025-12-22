"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { colleagues as dummyColleagues } from "@/app/dashboard/answers/DummyData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ColleagueModal({
  isOpen,
  onClose,
  colleagues,
  setColleagues,
}: {
  isOpen: boolean;
  onClose: () => void;
  colleagues: any[];
  setColleagues: any;
}) {
  const [tempColleague, setTempColleague] = useState({
    name: "",
    infoNeeded: "",
  });

  const handleAddColleague = () => {
    if (tempColleague.name.trim()) {
      setColleagues([...colleagues, { ...tempColleague }]);
      setTempColleague({ name: "", infoNeeded: "" });
      onClose();
    }
  };

  const closeModal = () => {
    setTempColleague({ name: "", infoNeeded: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button
            type="button"
            aria-label="Close modal"
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Colleague
            </label>
            <Select
              value={tempColleague.name}
              onValueChange={(value) =>
                setTempColleague({ ...tempColleague, name: value })
              }
            >
              <SelectTrigger className="w-full text-sm border border-gray-200 rounded-lg h-[42px] focus:ring-0 focus:ring-offset-0 px-3 py-2.5">
                <SelectValue placeholder="Select a colleague" />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                {dummyColleagues.map((colleague) => (
                  <SelectItem key={colleague.id} value={colleague.name}>
                    {colleague.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              What information do you need from them?
            </label>
            <textarea
              placeholder="Describe what specific information, data, or insights you need..."
              value={tempColleague.infoNeeded}
              onChange={(e) =>
                setTempColleague({
                  ...tempColleague,
                  infoNeeded: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none resize-none h-24"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={handleAddColleague}
            disabled={!tempColleague.name.trim()}
            variant="default"
          >
            Add Colleague
          </Button>
        </div>
      </div>
    </div>
  );
}
