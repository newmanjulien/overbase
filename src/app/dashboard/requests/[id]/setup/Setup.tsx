"use client";

import { format } from "date-fns";
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
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  minSelectableDate: Date;
}

export default function Setup({
  prompt,
  scheduledDate,
  errors,
  setPrompt,
  setScheduledDate,
  onSubmit,
  onCancel,
  minSelectableDate,
}: SetupProps) {
  return (
    <SetupLayout
      sidebarBackText="Back to requests"
      onSidebarBack={onCancel}
      sidebarTitle="Request data about your customer"
      title="Explain what data you need"
      subtitle="Fill out the details to configure your request. You can set the prompt and schedule a date below."
      onFlowBack={onCancel}
      primaryButtonText="Next"
      onSubmit={onSubmit}
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
                scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"
              }
              title={
                scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"
              }
            >
              {scheduledDate ? (
                format(scheduledDate, "PPP")
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
