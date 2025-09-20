"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { RowCard } from "@/components/RowCard";
import { InfoCard } from "@/components/InfoCard";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";

interface Colleague {
  id: string;
  name: string;
  role: string;
}

const mockColleagues: Colleague[] = [
  { id: "1", name: "John Smith", role: "Developer" },
  { id: "2", name: "Sarah Wilson", role: "Designer" },
  { id: "3", name: "Mike Johnson", role: "Product Manager" },
];

function ColleaguesLayout() {
  const [selectedColleagues, setSelectedColleagues] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedColleagues(mockColleagues.map((c) => c.id));
    } else {
      setSelectedColleagues([]);
    }
  };

  const handleSelectColleague = (colleagueId: string, checked: boolean) => {
    if (checked) {
      setSelectedColleagues((prev) => [...prev, colleagueId]);
    } else {
      setSelectedColleagues((prev) => prev.filter((id) => id !== colleagueId));
      setSelectAll(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Colleagues"
        subtitle="Add colleagues who you want us to consult while collecting data for you or who you want us to send data to."
        buttonLabel="Add colleague"
        onButtonClick={() => {}}
        variant="black"
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="w-full flex flex-col gap-3">
          {/* Select All card */}
          <RowCard
            title="Select all"
            titleClassName="text-gray-500 font-normal"
            leading={
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
              />
            }
            menu={
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
          />

          {/* Colleague cards */}
          {mockColleagues.map((colleague) => (
            <RowCard
              key={colleague.id}
              title={colleague.name}
              subtitle={colleague.role}
              image="/images/shopify.png"
              leading={
                <Checkbox
                  checked={selectedColleagues.includes(colleague.id)}
                  onCheckedChange={(checked) =>
                    handleSelectColleague(colleague.id, checked as boolean)
                  }
                  className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
                />
              }
              menu={
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
            text="We can contact colleagues on your behalf when we're collecting data for your requests"
            linkText="Request data"
            onClick={() => router.push("/dashboard/requests")}
          />
        </div>
      </div>
    </div>
  );
}

export default function ColleaguesPage() {
  return <ColleaguesLayout />;
}
