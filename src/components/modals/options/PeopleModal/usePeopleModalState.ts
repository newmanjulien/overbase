"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { PersonAttachmentWithInfo } from "../../types";
import type { PersonReference } from "@/lib/questions";

export function usePeopleModalState(
  people: PersonAttachmentWithInfo[],
  setPeople: (p: PersonAttachmentWithInfo[]) => void,
  onClose: () => void
) {
  // Fetch people from database
  const dbPeople = useQuery(api.features.people.getAllPeople) ?? [];
  const allPeople = useMemo(
    (): PersonReference[] =>
      dbPeople.map((p) => ({
        id: p._id,
        name: p.name,
        photo: p.photo,
      })),
    [dbPeople]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [infoNeeded, setInfoNeeded] = useState("");

  const filteredPeople = useMemo(() => {
    return allPeople.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPeople, searchQuery]);

  const selectedPeople = useMemo(() => {
    return allPeople.filter((p) => selectedIds.includes(p.id));
  }, [allPeople, selectedIds]);

  const togglePerson = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddPeople = () => {
    if (selectedIds.length > 0) {
      const newEntries = selectedPeople.map((p) => ({
        id: p.id,
        name: p.name,
        infoNeeded: infoNeeded,
        photo: p.photo,
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
  };
}
