"use client";

import { useState, useMemo } from "react";
import { dummyPeople, type ForwardEntry } from "../shared/modalTypes";

export function useForwardModalState(
  people: ForwardEntry[],
  setPeople: (p: ForwardEntry[]) => void,
  onClose: () => void
) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [infoNeeded, setInfoNeeded] = useState("");
  const [selectionType, setSelectionType] = useState("only dataset");

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
        selectionType: selectionType,
      }));
      setPeople([...people, ...newEntries]);
      closeModal();
    }
  };

  const closeModal = () => {
    setSelectedIds([]);
    setSearchQuery("");
    setInfoNeeded("");
    setSelectionType("only dataset");
    onClose();
  };

  return {
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
    closeModal,
  };
}
