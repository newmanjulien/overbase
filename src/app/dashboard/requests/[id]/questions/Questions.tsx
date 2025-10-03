"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Calendar as CalendarIcon } from "lucide-react";
import SetupLayout from "@/components/layouts/SetupLayout";
import { formatDisplayDate } from "@/lib/requestDates";

const REPEAT = [
  "Does not repeat",
  "Every week",
  "Every month",
  "Every quarter",
];

interface QuestionsProps {
  scheduledDate: Date | null;
  setScheduledDate: (d: Date | null) => void;
  errors: { scheduledDate?: string };
  onSubmit: () => void;
  onBack: () => void;
  onHome: () => void;
  minSelectableDate: Date;
  mode: "create" | "edit" | "editDraft";
}

export default function Questions({
  scheduledDate,
  setScheduledDate,
  errors,
  onSubmit,
  onBack,
  onHome,
  minSelectableDate,
}: QuestionsProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  return (
    <SetupLayout
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Schedule your data request"
      title="Schedule your request"
      subtitle="When do you need the data and is this request recurring?"
      primaryButtonText="Next"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Back"
      onSecondaryAction={onBack}
    >
      <div>
        <Label htmlFor="scheduledDate" className="mb-3 block">
          When do you need this data?
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {scheduledDate ? formatDisplayDate(scheduledDate) : "Pick a date"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end">
            <Calendar
              mode="single"
              selected={scheduledDate ?? undefined}
              onSelect={(d) => setScheduledDate(d ?? null)}
              disabled={(date) => date < minSelectableDate}
            />
          </PopoverContent>
        </Popover>
        {errors.scheduledDate && (
          <p className="text-red-500 text-sm">{errors.scheduledDate}</p>
        )}
      </div>

      <Label htmlFor="scheduledDate" className="mt-6 mb-3 block">
        Is this recurring?
      </Label>
      <Select
        onValueChange={(val) => setSelectedCustomer(val)}
        defaultValue={REPEAT[0]} // 👈 set first option as default
      >
        <SelectTrigger className="mt-4 w-full border border-grey-100 rounded-md">
          <SelectValue /> {/* no placeholder here */}
        </SelectTrigger>
        <SelectContent>
          {REPEAT.map((cust) => (
            <SelectItem key={cust} value={cust}>
              {cust}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SetupLayout>
  );
}
