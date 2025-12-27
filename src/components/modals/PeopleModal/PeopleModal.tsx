"use client";

import { Button } from "@/components/ui/button";
import { Search, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AttachmentChip } from "../shared/AttachmentChip";
import { ModalShell } from "../shared/ModalShell";
import { usePeopleModalState } from "./usePeopleModalState";
import type { PersonAttachmentWithInfo } from "../shared/modalTypes";

export default function PeopleModal({
  isOpen,
  onClose,
  people,
  setPeople,
}: {
  isOpen: boolean;
  onClose: () => void;
  people: PersonAttachmentWithInfo[];
  setPeople: (people: PersonAttachmentWithInfo[]) => void;
}) {
  const {
    selectedIds,
    searchQuery,
    setSearchQuery,
    infoNeeded,
    setInfoNeeded,
    filteredPeople,
    selectedPeople,
    togglePerson,
    handleAddPeople,
    closeModal,
  } = usePeopleModalState(people, setPeople, onClose);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={closeModal}
      footer={
        <Button
          onClick={handleAddPeople}
          disabled={selectedIds.length === 0}
          variant="default"
        >
          Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}
          {selectedIds.length === 1 ? "Person" : "People"}
        </Button>
      }
    >
      {/* People Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Who do you want to collect data from?
        </label>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedPeople.map((p) => (
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
          What information do you need from them?{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          placeholder="Describe what specific information, data, or insights you need..."
          value={infoNeeded}
          onChange={(e) => setInfoNeeded(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none resize-none h-24"
        />
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">
          Overbase will send a personalized email to the people you select,
          requesting the information you&apos;ve described. Their responses will
          be automatically incorporated into your answer.
        </p>
      </div>
    </ModalShell>
  );
}
