"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { RowCard } from "@/components/cards/RowCard";
import { InfoCard } from "@/components/cards/InfoCard";
import { Header } from "@/components/blocks/Header";
import { getRandomName } from "./namesDictionary";

export default function People() {
  const people = useQuery(api.features.people.getAllPeople) ?? [];
  const addPerson = useMutation(api.features.people.addPerson);
  const deletePerson = useMutation(api.features.people.deletePerson);
  const deleteMultiplePeople = useMutation(api.features.people.deletePeople);

  const [selectedPeople, setSelectedPeople] = useState<Id<"people">[]>([]);

  // Derive selectAll state
  const allSelected =
    people.length > 0 && selectedPeople.length === people.length;
  const someSelected =
    selectedPeople.length > 0 && selectedPeople.length < people.length;

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedPeople(people.map((p) => p._id));
    } else {
      setSelectedPeople([]);
    }
  };

  const handleSelectPerson = (personId: Id<"people">, checked: boolean) => {
    if (checked) {
      setSelectedPeople((prev) => [...prev, personId]);
    } else {
      setSelectedPeople((prev) => prev.filter((id) => id !== personId));
    }
  };

  const handleAddPerson = async () => {
    await addPerson({ name: getRandomName() });
  };

  const handleDeletePerson = async (id: Id<"people">) => {
    await deletePerson({ id });
    setSelectedPeople((prev) => prev.filter((pid) => pid !== id));
  };

  const handleDeleteSelected = async () => {
    await deleteMultiplePeople({ ids: selectedPeople });
    setSelectedPeople([]);
  };

  // Map status to display text
  const getStatusText = (status?: "ready" | "waiting") => {
    if (status === "waiting") return "Waiting for response";
    return "Ready to request data";
  };

  return (
    <div className="h-full w-full">
      <Header
        title="People"
        subtitle="Add people who you want to request data from."
        buttonLabel="Add person"
        onButtonClick={handleAddPerson}
        buttonVariant="default"
        learnMoreLink="#"
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="w-full flex flex-col gap-3">
          {/* Select All row */}
          <RowCard
            title="Select all"
            titleClassName="text-gray-500 font-normal"
            leading={
              <Checkbox
                checked={
                  allSelected ? true : someSelected ? "indeterminate" : false
                }
                onCheckedChange={handleSelectAll}
                className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 
                  data-[state=checked]:border-gray-800 rounded-sm"
              />
            }
            menuItems={[
              {
                label: "Delete",
                onClick: handleDeleteSelected,
                destructive: true,
              },
            ]}
          />

          {/* Person rows */}
          {people.map((person) => (
            <RowCard
              key={person._id}
              title={person.name}
              subtitle={getStatusText(person.status)}
              image="" // fallback letter
              showAvatar
              leading={
                <Checkbox
                  checked={selectedPeople.includes(person._id)}
                  onCheckedChange={(checked) =>
                    handleSelectPerson(person._id, checked as boolean)
                  }
                  className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 
                    data-[state=checked]:border-gray-800 rounded-sm"
                />
              }
              menuItems={[
                {
                  label: "Edit",
                  onClick: () => console.log("Edit", person._id),
                },
                {
                  label: "Delete",
                  onClick: () => handleDeletePerson(person._id),
                  destructive: true,
                },
              ]}
            />
          ))}
        </div>

        <div className="mt-8 w-full">
          <InfoCard text="Manage the people in your organization and their access levels." />
        </div>
      </div>
    </div>
  );
}
