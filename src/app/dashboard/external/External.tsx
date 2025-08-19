"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { RowCard } from "../../../components/RowCard";
import { InfoCard } from "../../../components/InfoCard";
import { useRouter } from "next/navigation";
import { Header } from "../../../components/Header";

interface ExternalPartner {
  id: string;
  name: string;
  company: string;
}

const mockExternalPartners: ExternalPartner[] = [
  { id: "101", name: "Emily Carter", company: "Acme Corp" },
  { id: "102", name: "David Lee", company: "Globex Inc" },
  { id: "103", name: "Olivia Martinez", company: "Initech" },
];

export function External() {
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedPartners(mockExternalPartners.map((p) => p.id));
    } else {
      setSelectedPartners([]);
    }
  };

  const handleSelectPartner = (partnerId: string, checked: boolean) => {
    if (checked) {
      setSelectedPartners((prev) => [...prev, partnerId]);
    } else {
      setSelectedPartners((prev) => prev.filter((id) => id !== partnerId));
      setSelectAll(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <Header
        title="External Partners"
        subtitle="Add external partners so you can reference them in workflows and so your AI can collaborate with them on your tasks."
        buttonLabel="Add external partner"
        onButtonClick={() => {}}
        variant="black"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="w-full flex flex-col gap-3">
          {/* Select All card */}
          <RowCard
            title="Select all"
            titleClassName="text-gray-500 font-normal"
            subtitle=""
            buttonLabel=""
            buttonOnClick={undefined}
            leading={
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
              />
            }
            actions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-32 bg-white border border-gray-300 shadow-lg"
                >
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            image={undefined}
          />

          {/* External Partner cards */}
          {mockExternalPartners.map((partner) => (
            <RowCard
              key={partner.id}
              title={partner.name}
              subtitle={partner.company}
              image={undefined}
              buttonLabel=""
              buttonOnClick={undefined}
              leading={
                <Checkbox
                  checked={selectedPartners.includes(partner.id)}
                  onCheckedChange={(checked) =>
                    handleSelectPartner(partner.id, checked as boolean)
                  }
                  className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
                />
              }
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-32 bg-white border border-gray-300 shadow-lg"
                  >
                    <DropdownMenuItem className="text-gray-700 focus:bg-gray-100">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))}
        </div>

        {/* InfoCard at the bottom */}
        <div className="mt-8 w-full">
          <InfoCard
            text="Your AI can collaborate with both external partners and internal colleagues"
            linkText="Colleagues"
            onClick={() => router.push("/dashboard/colleagues")}
          />
        </div>
      </div>
    </div>
  );
}
