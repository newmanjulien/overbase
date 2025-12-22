"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RowCard } from "@/components/blocks/RowCard";
import { InfoCard } from "@/components/blocks/InfoCard";
import { useRouter } from "next/navigation";
import { Header } from "@/components/blocks/Header";

interface Person {
  id: string;
  name: string;
  renewal: string;
}

const mockPeople: Person[] = [
  {
    id: "101",
    name: "Alex Carp",
    renewal: "Ready to request data",
  },
  { id: "102", name: "Gloria Incara", renewal: "Waiting for response" },
  { id: "103", name: "Ingrid Newell", renewal: "Ready to request data" },
];

function PeopleLayout() {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const router = useRouter();

  // Derive selectAll state
  const allSelected = selectedPeople.length === mockPeople.length;
  const someSelected =
    selectedPeople.length > 0 && selectedPeople.length < mockPeople.length;

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedPeople(mockPeople.map((p) => p.id));
    } else {
      setSelectedPeople([]);
    }
  };

  const handleSelectPerson = (personId: string, checked: boolean) => {
    if (checked) {
      setSelectedPeople((prev) => [...prev, personId]);
    } else {
      setSelectedPeople((prev) => prev.filter((id) => id !== personId));
    }
  };

  return (
    <div className="h-full w-full">
      <Header
        title="People"
        subtitle="Add people who you want to request data from."
        buttonLabel="Add person"
        onButtonClick={() => {}}
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
                onClick: () => console.log("Delete all selected"),
                destructive: true,
              },
            ]}
          />

          {/* Person rows */}
          {mockPeople.map((person) => (
            <RowCard
              key={person.id}
              title={person.name}
              subtitle={`${person.renewal}`}
              image="" // fallback letter
              showAvatar
              leading={
                <Checkbox
                  checked={selectedPeople.includes(person.id)}
                  onCheckedChange={(checked) =>
                    handleSelectPerson(person.id, checked as boolean)
                  }
                  className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 
                    data-[state=checked]:border-gray-800 rounded-sm"
                />
              }
              menuItems={[
                {
                  label: "Edit",
                  onClick: () => console.log("Edit", person.id),
                },
                {
                  label: "Delete",
                  onClick: () => console.log("Delete", person.id),
                  destructive: true,
                },
              ]}
            />
          ))}
        </div>

        {/* InfoCard at the bottom */}
        <div className="mt-8 w-full">
          <InfoCard
            text="You can easily request data from people after having added and set them up here"
            linkText="Requests"
            onClick={() => router.push("/dashboard/requests")}
          />
        </div>
      </div>
    </div>
  );
}

export default function PeoplePage() {
  return <PeopleLayout />;
}
