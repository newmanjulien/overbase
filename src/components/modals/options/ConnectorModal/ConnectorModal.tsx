"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttachmentChip } from "../../../blocks/AttachmentChipList";
import { useConnectorModalState } from "./useConnectorModalState";
import type { ConnectorReference } from "../../types";
import { SearchableChecklist } from "@/components/blocks/SearchableChecklist";

interface ConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: ConnectorReference[];
  setConnectors: (connectors: ConnectorReference[]) => void;
}

export default function ConnectorModal({
  isOpen,
  onClose,
  connectors,
  setConnectors,
}: ConnectorModalProps) {
  const {
    selectedIds,
    searchQuery,
    setSearchQuery,
    filteredConnectors,
    selectedConnectorObjects,
    toggleConnector,
    handleAddConnectors,
    closeModal,
  } = useConnectorModalState(connectors, setConnectors, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogTitle className="sr-only">Select Connectors</DialogTitle>
        <div className="-mx-4 -mt-4 h-10" />
        <div className="space-y-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Which connectors should Overbase use?
          </label>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedConnectorObjects.map((c) => (
                <AttachmentChip
                  key={c.id}
                  icon={
                    <Image
                      src={c.logo}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5 rounded-sm object-contain"
                    />
                  }
                  label={c.title}
                  onRemove={() => toggleConnector(c.id)}
                />
              ))}
            </div>
          )}

          <div>
            <SearchableChecklist
              items={filteredConnectors.map((c) => ({
                id: c.id,
                label: c.title,
                icon: (
                  <Image
                    src={c.logo}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-sm object-contain"
                  />
                ),
              }))}
              selectedIds={selectedIds}
              onToggle={toggleConnector}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search connectors..."
              emptyMessage="No connectors found"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddConnectors}
            disabled={selectedIds.length === 0}
            variant="default"
          >
            Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}
            {selectedIds.length === 1 ? "Connector" : "Connectors"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
