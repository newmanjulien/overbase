"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatISO, startOfToday, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { RequestItem } from "../../Client";

export default function RequestSetupPage() {
  const { id } = useParams();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [errors, setErrors] = useState<{
    prompt?: string;
    scheduledDate?: string;
  }>({});

  // Load existing request values if editing
  useEffect(() => {
    // TODO: Replace with context/global state if needed
    const stored = window.localStorage.getItem("requests");
    if (stored) {
      const all: RequestItem[] = JSON.parse(stored);
      const existing = all.find((r) => r.id === id);
      if (existing) {
        setPrompt(existing.prompt);
        setScheduledDate(existing.scheduledDate);
      }
    }
  }, [id]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!prompt.trim()) {
      errs.prompt = "Prompt is required.";
    }
    if (!scheduledDate) {
      errs.scheduledDate = "Scheduled date is required.";
    } else {
      const today = startOfToday();
      const minDate = addDays(today, 2); // must be ≥ +2 days
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

    // Save to localStorage (acting as local component state persistence)
    const stored = window.localStorage.getItem("requests");
    let all: RequestItem[] = stored ? JSON.parse(stored) : [];
    all = all.filter((r) => r.id !== updated.id);
    all.push(updated);
    window.localStorage.setItem("requests", JSON.stringify(all));

    router.push("/dashboard/requests");
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Setup Request</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prompt */}
        <div>
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            className="mt-1"
          />
          {errors.prompt && (
            <p className="text-red-500 text-sm mt-1">{errors.prompt}</p>
          )}
        </div>

        {/* Scheduled Date */}
        <div>
          <Label htmlFor="scheduledDate">Scheduled Date</Label>
          <Input
            type="date"
            id="scheduledDate"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
            className="mt-1"
          />
          {errors.scheduledDate && (
            <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard/requests")}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
