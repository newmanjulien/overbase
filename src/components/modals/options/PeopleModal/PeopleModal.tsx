"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentChip } from "../../../blocks/AttachmentChipList";
import { usePeopleModalState } from "./usePeopleModalState";
import type { PersonAttachmentWithInfo, PersonReference } from "../../types";
import { SearchableChecklist } from "@/components/blocks/SearchableChecklist";

/** Get initials from a name (first + last, or just first letter) */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

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
  } = usePeopleModalState(people, setPeople, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="sr-only">Select People</DialogTitle>
        <div className="-mx-4 -mt-4 h-10" />
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Who do you want to collect data from?
            </label>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedPeople.map((p: PersonReference) => (
                  <AttachmentChip
                    key={p.id}
                    icon={
                      <Avatar className="h-3.5 w-3.5">
                        {p.photo && <AvatarImage src={p.photo} />}
                        <AvatarFallback className="text-[8px] bg-gray-200">
                          {getInitials(p.name)}
                        </AvatarFallback>
                      </Avatar>
                    }
                    label={p.name}
                    onRemove={() => togglePerson(p.id)}
                  />
                ))}
              </div>
            )}

            <SearchableChecklist
              items={filteredPeople.map((p: PersonReference) => ({
                id: p.id,
                label: p.name,
                icon: (
                  <Avatar className="h-5 w-5">
                    {p.photo && <AvatarImage src={p.photo} />}
                    <AvatarFallback className="text-[10px] bg-gray-200">
                      {getInitials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                ),
              }))}
              selectedIds={selectedIds}
              onToggle={togglePerson}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search people..."
              emptyMessage="No people found"
            />
          </div>

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
            <p className="mt-1 text-sm text-gray-500">
              Selected people will receive email requests for this information.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddPeople}
            disabled={selectedIds.length === 0}
            variant="default"
          >
            Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}
            {selectedIds.length === 1 ? "Person" : "People"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
