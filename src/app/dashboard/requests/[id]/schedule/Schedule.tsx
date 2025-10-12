"use client";

import { useMemo } from "react";

import SetupLayout from "@/components/layouts/SetupLayout";

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
import {
  formatDisplayDate,
  getRepeatOptions,
  type RepeatRule,
} from "@/lib/requests/Dates";

interface ScheduleProps {
  scheduledDate: Date | null;
  setScheduledDate: (d: Date | null) => void;
  repeat: RepeatRule["type"];
  setRepeat: (val: RepeatRule["type"]) => void;
  errors: { scheduledDate?: string };
  onSubmit: () => void;
  onBack: () => void;
  onHome: () => void;
  minSelectableDate: Date;
  mode: "create" | "edit" | "editDraft";
  status?: "draft" | "active";
  setStatus?: (val: "draft" | "active") => void;
  onDelete?: () => void;
}

export default function Schedule({
  scheduledDate,
  setScheduledDate,
  repeat,
  setRepeat,
  errors,
  onSubmit,
  onBack,
  onHome,
  minSelectableDate,
  mode,
  status,
  setStatus,
  onDelete,
}: ScheduleProps) {
  const repeatOptions = useMemo(
    () => getRepeatOptions(scheduledDate),
    [scheduledDate],
  );

  return (
    <SetupLayout
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Schedule your data request"
      title="Schedule your request"
      subtitle="When do you need the data and should this request repeat?"
      primaryButtonText="Next"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Back"
      onSecondaryAction={onBack}
      {...(mode !== "create" &&
        setStatus &&
        onDelete && {
          sidebarActionText: "Delete request",
          onSidebarAction: onDelete,
          toggleValue: status,
          onToggleChange: (val) => void setStatus(val as "draft" | "active"),
          toggleOptions: [
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
          ],
        })}
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

      <Label htmlFor="repeat" className="mt-6 mb-3 block">
        Should this repeat?
      </Label>
      <Select value={repeat} onValueChange={setRepeat}>
        <SelectTrigger className="mt-4 w-full border border-grey-50 rounded-xl">
          <SelectValue>
            {repeatOptions.find((o) => o.key === repeat)?.label ??
              "Select a cadence"}
          </SelectValue>{" "}
        </SelectTrigger>
        <SelectContent>
          {repeatOptions.map((opt) => (
            <SelectItem key={opt.key} value={opt.key}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SetupLayout>
  );
}
