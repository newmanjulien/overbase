"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X, Search, Users } from "lucide-react";
import { people as dummyPeople } from "@/app/dashboard/answers/DummyData";
import { Checkbox } from "@/components/ui/checkbox";
import { AttachmentChip } from "./QuestionModal/AttachmentChip";

export default function PeopleModal({
  isOpen,
  onClose,
  people,
  setPeople,
}: {
  isOpen: boolean;
  onClose: () => void;
  people: any[];
  setPeople: any;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [infoNeeded, setInfoNeeded] = useState("");

  const filteredPeople = useMemo(() => {
    return dummyPeople.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const togglePerson = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddPeople = () => {
    if (selectedIds.length > 0) {
      const selectedPeopleObjects = dummyPeople.filter((p) =>
        selectedIds.includes(p.id)
      );
      const newEntries = selectedPeopleObjects.map((p) => ({
        name: p.name,
        infoNeeded: infoNeeded,
      }));
      setPeople([...people, ...newEntries]);
      closeModal();
    }
  };

  const closeModal = () => {
    setSelectedIds([]);
    setSearchQuery("");
    setInfoNeeded("");
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
          {/* People Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select People
            </label>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {dummyPeople
                  .filter((p) => selectedIds.includes(p.id))
                  .map((p) => (
                    <AttachmentChip
                      key={p.id}
                      icon={<Users className="h-3.5 w-3.5" />}
                      label={p.name}
                      onRemove={() => togglePerson(p.id)}
                    />
                  ))}
              </div>
            )}

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

          {/* Info Needed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              What information do you need from them?
            </label>
            <textarea
              placeholder="Describe what specific information, data, or insights you need..."
              value={infoNeeded}
              onChange={(e) => setInfoNeeded(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none resize-none h-24"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <Button
            onClick={handleAddPeople}
            disabled={selectedIds.length === 0}
            variant="default"
          >
            Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}
            {selectedIds.length === 1 ? "Person" : "People"}
          </Button>
        </div>
      </div>
    </div>
  );
}
