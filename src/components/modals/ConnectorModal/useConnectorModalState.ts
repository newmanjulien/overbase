"use client";

import { useState, useMemo } from "react";
import { connectors } from "@/app/dashboard/connectors/DummyData";
import type { ConnectorAttachment } from "../shared/modalTypes";

/**
 * Hook for managing ConnectorModal state.
 * Uses hardcoded connector data for now - will be replaced with DB query in Phase 4.
 */
export function useConnectorModalState(
  selectedConnectors: ConnectorAttachment[],
  setConnectors: (c: ConnectorAttachment[]) => void,
  onClose: () => void
) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Get available connectors (active ones only for now)
  const availableConnectors = useMemo(() => {
    return connectors.filter((c) => c.status === "active");
  }, []);

  // Filter by search query
  const filteredConnectors = useMemo(() => {
    return availableConnectors.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableConnectors, searchQuery]);

  // Get selected connector objects
  const selectedConnectorObjects = useMemo(() => {
    return availableConnectors.filter((c) => selectedIds.includes(c.id));
  }, [availableConnectors, selectedIds]);

  const toggleConnector = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddConnectors = () => {
    if (selectedIds.length > 0) {
      const newEntries: ConnectorAttachment[] = selectedConnectorObjects.map(
        (c) => ({
          id: c.id,
          title: c.title,
          logo: c.logo,
        })
      );
      // Add to existing connectors (avoiding duplicates)
      const existingIds = selectedConnectors.map((c) => c.id);
      const uniqueNew = newEntries.filter((c) => !existingIds.includes(c.id));
      setConnectors([...selectedConnectors, ...uniqueNew]);
      closeModal();
    }
  };

  const closeModal = () => {
    setSelectedIds([]);
    setSearchQuery("");
    onClose();
  };

  return {
    selectedIds,
    searchQuery,
    setSearchQuery,
    filteredConnectors,
    selectedConnectorObjects,
    toggleConnector,
    handleAddConnectors,
    closeModal,
  };
}
