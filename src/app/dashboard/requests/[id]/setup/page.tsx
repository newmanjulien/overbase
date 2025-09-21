"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { startOfToday, addDays, format } from "date-fns";
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

export default function RequestSetupPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [errors, setErrors] = useState<{
    prompt?: string;
    scheduledDate?: string;
  }>({});

  // 👇 check query param for ?date=
  useEffect(() => {
    const dateParam = searchParams.get("date");

    // Prefill from ?date if available
    if (dateParam && !scheduledDate) {
      setScheduledDate(dateParam);
    }

    // Load existing request from localStorage
    const stored = window.localStorage.getItem("requests");
    if (stored) {
      const all: RequestItem[] = JSON.parse(stored);
      const existing = all.find((r) => r.id === id);
      if (existing) {
        setPrompt(existing.prompt);
        setScheduledDate(existing.scheduledDate);
      }
    }
  }, [id, searchParams, scheduledDate]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!prompt.trim()) {
      errs.prompt = "Prompt is required.";
    }
    if (!scheduledDate) {
      errs.scheduledDate = "Scheduled date is required.";
    } else {
      const today = startOfToday();
      const minDate = addDays(today, 2);
      const selected = new Date(scheduledDate + "T00:00:00Z");
      if (selected < minDate) {
        errs.scheduledDate = "Date must be at least 2 days in the future.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updated: RequestItem = {
      id: id as string,
      prompt,
      scheduledDate,
    };

    const stored = window.localStorage.getItem("requests");
    let all: RequestItem[] = stored ? JSON.parse(stored) : [];
    all = all.filter((r) => r.id !== updated.id);
    all.push(updated);
    window.localStorage.setItem("requests", JSON.stringify(all));

    router.push("/dashboard/requests");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
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

      {/* Main Content */}
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
                >
                  {scheduledDate ? (
                    format(new Date(scheduledDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate ? new Date(scheduledDate) : undefined}
                  onSelect={(d) =>
                    setScheduledDate(d ? d.toISOString().split("T")[0] : "")
                  }
                  disabled={(date) => date < addDays(startOfToday(), 2)}
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
            <Button type="submit">Request</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
