"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { ForwardEntry } from "../types";
import type { PersonReference } from "@/lib/questions";

export function useForwardModalState(
  people: ForwardEntry[],
  setPeople: (p: ForwardEntry[]) => void,
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
  const [selectionType, setSelectionType] = useState("only dataset");

  const filteredPeople = useMemo(() => {
    return allPeople.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPeople, searchQuery]);

  const togglePerson = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddPeople = () => {
    if (selectedIds.length > 0) {
      const selectedPeopleObjects = allPeople.filter((p) =>
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
  };
}
