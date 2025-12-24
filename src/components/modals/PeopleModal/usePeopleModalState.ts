"use client";

import { useState, useMemo } from "react";
import { people as dummyPeople } from "@/app/dashboard/answers/DummyData";

export function usePeopleModalState(
  people: any[],
  setPeople: (p: any[]) => void,
  onClose: () => void
) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [infoNeeded, setInfoNeeded] = useState("");

  const filteredPeople = useMemo(() => {
    return dummyPeople.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedPeople = useMemo(() => {
    return dummyPeople.filter((p) => selectedIds.includes(p.id));
  }, [selectedIds]);

  const togglePerson = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddPeople = () => {
    if (selectedIds.length > 0) {
      const newEntries = selectedPeople.map((p) => ({
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

  return {
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
  };
}
