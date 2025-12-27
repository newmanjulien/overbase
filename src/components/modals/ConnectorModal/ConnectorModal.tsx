"use client";

import { Button } from "@/components/ui/button";
import { Search, Plug } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AttachmentChip } from "../shared/AttachmentChip";
import { ModalShell } from "../shared/ModalShell";
import { useConnectorModalState } from "./useConnectorModalState";
import type { ConnectorAttachment } from "../shared/modalTypes";

interface ConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: ConnectorAttachment[];
  setConnectors: (connectors: ConnectorAttachment[]) => void;
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
    <ModalShell
      isOpen={isOpen}
      onClose={closeModal}
      footer={
        <Button
          onClick={handleAddConnectors}
          disabled={selectedIds.length === 0}
          variant="default"
        >
          Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}
          {selectedIds.length === 1 ? "Connector" : "Connectors"}
        </Button>
      }
    >
      {/* Connector Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Which connectors should Overbase use?
        </label>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedConnectorObjects.map((c) => (
              <AttachmentChip
                key={c.id}
                icon={
                  <img
                    src={c.logo}
                    alt=""
                    className="h-3.5 w-3.5 rounded-sm object-contain"
                  />
                }
                label={c.title}
                onRemove={() => toggleConnector(c.id)}
              />
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none"
          />
        </div>

        <div className="max-h-[160px] overflow-y-auto pr-2 space-y-1">
          {filteredConnectors.map((connector) => (
            <div
              key={connector.id}
              onClick={() => toggleConnector(connector.id)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <Checkbox
                checked={selectedIds.includes(connector.id)}
                onCheckedChange={() => toggleConnector(connector.id)}
                className="rounded border-gray-300"
              />
              <img
                src={connector.logo}
                alt=""
                className="h-5 w-5 rounded-sm object-contain"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {connector.title}
              </span>
            </div>
          ))}
          {filteredConnectors.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-500">
              No connectors found
            </div>
          )}
        </div>
      </div>

      {/* Helper text */}
      <p className="mt-4 text-xs text-gray-500 leading-relaxed">
        Overbase will query data from the selected connectors when answering
        your question.
      </p>
    </ModalShell>
  );
}
