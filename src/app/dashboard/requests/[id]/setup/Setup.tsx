"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { startOfToday, addDays, format, isBefore } from "date-fns";
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

const DRAFT_KEY = (id: string) => `request_draft:${id}`;

function getDraft<T = unknown>(id: string): T | null {
  const raw = window.sessionStorage.getItem(DRAFT_KEY(id));
  return raw ? JSON.parse(raw) : null;
}

type Draft = { id: string; prompt: string; scheduledDate: string };

function saveDraft(id: string, draft: Draft) {
  window.sessionStorage.setItem(DRAFT_KEY(id), JSON.stringify(draft));
}

function clearDraft(id: string) {
  window.sessionStorage.removeItem(DRAFT_KEY(id));
}

// Parse "YYYY-MM-DD" as a *local* date
function parseISODateLocal(s: string | null | undefined): Date | null {
  if (!s) return null;
  const parts = s.split("-");
  if (parts.length !== 3) return null;
  const [yStr, mStr, dStr] = parts;
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}

// Format Date as "YYYY-MM-DD" for storage/transport
function toISODateStringLocal(d: Date | null): string {
  return d ? format(d, "yyyy-MM-dd") : "";
}

interface SetupProps {
  requestId: string;
  prefillDate?: string;
}

export default function Setup({ requestId, prefillDate }: SetupProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{
    prompt?: string;
    scheduledDate?: string;
  }>({});

  const minSelectableDate = useMemo(() => addDays(startOfToday(), 2), []);

  // Prefill from query string once
  useEffect(() => {
    const dateParam = prefillDate;
    if (dateParam) {
      const currentStr = scheduledDate
        ? format(scheduledDate, "yyyy-MM-dd")
        : null;
      if (currentStr !== dateParam) {
        const d = parseISODateLocal(dateParam);
        if (d) setScheduledDate(d);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillDate]);

  // Load existing draft if present
  useEffect(() => {
    const draft = getDraft<Draft>(requestId);
    if (draft) {
      if (draft.prompt) {
        setPrompt(draft.prompt);
      }
      if (draft.scheduledDate) {
        const parsed = parseISODateLocal(draft.scheduledDate);
        if (parsed) setScheduledDate(parsed);
      }
    }
  }, [requestId]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!prompt.trim()) {
      errs.prompt = "Prompt is required.";
    }
    if (!scheduledDate) {
      errs.scheduledDate = "Scheduled date is required.";
    } else if (isBefore(scheduledDate, minSelectableDate)) {
      errs.scheduledDate = "Date must be at least 2 days in the future.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    saveDraft(requestId, {
      id: requestId,
      prompt,
      scheduledDate: toISODateStringLocal(scheduledDate),
    });

    router.push(`/dashboard/requests/${requestId}/questions`);
  };

  return (
    <SetupLayout
      // Sidebar
      sidebarBackText="Back to requests"
      onSidebarBack={() => {
        clearDraft(requestId);
        router.push("/dashboard/requests");
      }}
      sidebarTitle="Request data about your customer"
      // Main
      title="Explain what data you need"
      subtitle="Fill out the details to configure your request. You can set the prompt and schedule a date below."
      // Footer
      onFlowBack={() => {
        clearDraft(requestId);
        router.push("/dashboard/requests");
      }}
      primaryButtonText="Next"
      onSubmit={handleSubmit}
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
        {/* <Label htmlFor="scheduledDate" className="mb-2">
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
        )} */}

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
              {/* 👈 icon */}
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
