"use client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import SetupLayout from "@/components/layouts/SetupLayout";
import { formatDisplayDate } from "@/lib/requestDates";

interface QuestionsProps {
  scheduledDate: Date | null;
  setScheduledDate: (d: Date | null) => void;
  errors: { scheduledDate?: string };
  onSubmit: () => void;
  onBack: () => void;
  minSelectableDate: Date;
  mode: "create" | "edit" | "editDraft";
}

export default function Questions({
  scheduledDate,
  setScheduledDate,
  errors,
  onSubmit,
  onBack,
  minSelectableDate,
}: QuestionsProps) {
  return (
    <SetupLayout
      sidebarBackText="Back to requests"
      onSidebarBack={onBack}
      sidebarTitle="3 final and quick questions"
      title="Select a customer & schedule the request"
      subtitle="Which customer is this for and when do you need the data?"
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
    </SetupLayout>
  );
}
