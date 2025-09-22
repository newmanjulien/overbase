// src/app/dashboard/requests/[id]/setup/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { startOfToday, addDays, format, isBefore } from "date-fns";
import { ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { RequestItem } from "../../Client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Parse "YYYY-MM-DD" as a *local* date (avoid UTC shift)
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

export default function RequestSetupPage() {
  const { id } = useParams();
  const requestId = Array.isArray(id) ? id[0] : id;

  if (!requestId) {
    throw new Error("Request ID is missing in route.");
  }

  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState("");
  // UI state uses Date (dual-model)
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{
    prompt?: string;
    scheduledDate?: string;
  }>({});

  // (2) Single source of truth for min selectable date
  const minSelectableDate = useMemo(() => addDays(startOfToday(), 2), []);

  // (1) Prefill from query string once, but don't reset if it matches current state
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const currentStr = scheduledDate
        ? format(scheduledDate, "yyyy-MM-dd")
        : null;
      if (currentStr !== dateParam) {
        const d = parseISODateLocal(dateParam);
        if (d) setScheduledDate(d);
      }
    }
    // intentionally NOT depending on scheduledDate to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load existing item once per requestId change
  useEffect(() => {
    const stored = window.localStorage.getItem("requests");
    if (stored) {
      const all: RequestItem[] = JSON.parse(stored);
      const existing = all.find((r) => r.id === requestId);
      if (existing) {
        setPrompt(existing.prompt);
        const d = parseISODateLocal(existing.scheduledDate);
        if (d) setScheduledDate(d);
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
    } else {
      if (isBefore(scheduledDate, minSelectableDate)) {
        errs.scheduledDate = "Date must be at least 2 days in the future.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const stored = window.localStorage.getItem("requests");
    let all: RequestItem[] = stored ? JSON.parse(stored) : [];

    const existing = all.find((r) => r.id === requestId);
    const updated: RequestItem = {
      ...(existing || { id: requestId, q1: "", q2: "", q3: "" }),
      prompt,
      // Storage & transport: string "YYYY-MM-DD"
      scheduledDate: toISODateStringLocal(scheduledDate),
    };

    all = all.filter((r) => r.id !== updated.id);
    all.push(updated);
    window.localStorage.setItem("requests", JSON.stringify(all));

    router.push(`/dashboard/requests/${requestId}/questions`);
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-96 bg-gray-100 border-r border-gray-200 px-12 pt-12 pb-6 flex flex-col">
        <Button
          onClick={() => router.push("/dashboard/requests")}
          variant="backLink"
          size="backLink"
          leadingIcon={<ChevronLeft className="size-5" />}
        >
          Back to requests
        </Button>

        <h2 className="mt-6 text-2xl font-semibold text-gray-900 leading-tight">
          Request data about your customer
        </h2>
      </aside>

      <main className="flex-1 max-w-2xl mx-auto px-10 pt-12 pb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Explain what data you need
          </h1>
          <p className="text-sm text-gray-600">
            Fill out the details to configure your request. You can set the
            prompt and schedule a date below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  // (6) a11y micro-nit
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
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate ?? undefined}
                  onSelect={(d) => setScheduledDate(d ?? null)}
                  disabled={(date) => date < minSelectableDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.scheduledDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.scheduledDate}
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 my-6" />

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/requests")}
            >
              Back
            </Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
