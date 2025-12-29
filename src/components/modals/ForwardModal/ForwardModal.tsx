"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForwardModalState } from "./useForwardModalState";
import type { ForwardEntry } from "../types";

const DATASET_SELECTION_OPTIONS = [
  { label: "Send only this dataset", value: "only dataset" },
  { label: "Send the full Q&A", value: "full qa" },
];

export default function ForwardModal({
  isOpen,
  onClose,
  people,
  setPeople,
}: {
  isOpen: boolean;
  onClose: () => void;
  people: ForwardEntry[];
  setPeople: (people: ForwardEntry[]) => void;
}) {
  const {
    selectedIds,
    searchQuery,
    setSearchQuery,
    infoNeeded,
    setInfoNeeded,
    selectionType,
    setSelectionType,
    filteredPeople,
    togglePerson,
    handleAddPeople,
  } = useForwardModalState(people, setPeople, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="sr-only">Forward Data</DialogTitle>
        {/* People Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Who do you want to send this data to?
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="max-h-[160px] overflow-y-auto pr-2 space-y-1">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                onClick={() => togglePerson(person.id)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <Checkbox
                  checked={selectedIds.includes(person.id)}
                  onCheckedChange={() => togglePerson(person.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {person.name}
                </span>
              </div>
            ))}
            {filteredPeople.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                No people found
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Do you want to add a note?{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Describe what specific information, data, or insights you need..."
            value={infoNeeded}
            onChange={(e) => setInfoNeeded(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none resize-none h-24"
          />
        </div>

        {/* Dataset Selection */}
        <div className="flex gap-2">
          {DATASET_SELECTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectionType(option.value)}
              className={`flex-1 py-2 px-3 text-sm rounded-lg transition-all duration-150 ${
                selectionType === option.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={handleAddPeople}
            disabled={selectedIds.length === 0}
            variant="default"
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
