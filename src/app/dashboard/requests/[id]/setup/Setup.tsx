"use client";

import { formatDisplayDate } from "@/lib/requestDates";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import SetupLayout from "@/components/layouts/SetupLayout";

interface SetupProps {
  prompt: string;
  scheduledDate: Date | null;
  errors: { prompt?: string; scheduledDate?: string };
  setPrompt: (val: string) => void;
  setScheduledDate: (val: Date | null) => void;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  onHome: () => void | Promise<void>;
  onDraft: () => void | Promise<void>;
  minSelectableDate: Date;
  status: "draft" | "active";
  setStatus: (val: "draft" | "active") => void;
  mode: "create" | "edit" | "editDraft";
}

export default function Setup({
  prompt,
  scheduledDate,
  errors,
  setPrompt,
  setScheduledDate,
  onSubmit,
  onCancel,
  onHome,
  onDraft,
  minSelectableDate,
  status,
  setStatus,
  mode,
}: SetupProps) {
  return (
    <SetupLayout
      // Sidebar
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Request data about your customer"
      // Conditional UI elements
      {...(mode !== "create" && {
        sidebarActionText: "Delete request",
        onSidebarAction: onDraft,
        toggleValue: status,
        onToggleChange: (val) => setStatus(val as "draft" | "active"),
        toggleOptions: [
          { value: "draft", label: "Draft" },
          { value: "active", label: "Active" },
        ],
      })}
      // Main
      title="Explain what data you need"
      subtitle="Fill out the details to configure your request. You can set the prompt and schedule a date below."
      // Footer
      primaryButtonText="Next"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Cancel"
      onSecondaryAction={onCancel}
    >
      <div>
        <Label htmlFor="prompt" className="mb-2">
          Prompt
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          grow
          className="mt-1 min-h-40"
        />
        {errors.prompt && (
          <p className="text-red-500 text-sm mt-1">{errors.prompt}</p>
        )}
      </div>

      <div>
        <Label htmlFor="scheduledDate" className="mb-2">
          Scheduled Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left hover:bg-gray-50"
              aria-label={
                scheduledDate ? formatDisplayDate(scheduledDate) : "Pick a date"
              }
              title={
                scheduledDate ? formatDisplayDate(scheduledDate) : "Pick a date"
              }
            >
              {scheduledDate ? (
                formatDisplayDate(scheduledDate)
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />{" "}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={scheduledDate ?? undefined}
              onSelect={(d) => setScheduledDate(d ?? null)}
              disabled={(date) => date < minSelectableDate}
              defaultMonth={scheduledDate ?? undefined}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        {errors.scheduledDate && (
          <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
        )}
      </div>
    </SetupLayout>
  );
}
