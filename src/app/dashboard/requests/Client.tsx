"use client";

import { useMemo, useState } from "react";
import { today, toDateKey } from "@/lib/requestDates";
import { useRouter } from "next/navigation";

import type { CalendarProps } from "./Calendar";
import type { DataSectionProps } from "./DataSection";
import { Requests } from "./Requests";

import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/stores/useRequestListStore";

export interface RequestItem {
  id: string;
  prompt: string;
  scheduledDate: string;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
}

// 🔥 ADD: inline type for request handling
interface RequestOptions {
  prefillDate?: Date | null;
  mode?: "create" | "edit" | "editDraft";
}

export default function RequestsClient() {
  const router = useRouter();
  const initialToday = today();

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialToday);
  const [currentDate, setCurrentDate] = useState<Date>(initialToday);

  const { user } = useAuth();
  if (!user) {
    // Defensive guard: no user yet, render empty
    return null;
  }

  const { requests, createDraft } = useRequestListStore();

  const requestsByDate = useMemo(() => {
    const map: Record<string, RequestItem[]> = {};
    for (const r of requests) {
      if (!r.scheduledDate) continue;
      const key = toDateKey(r.scheduledDate);
      (map[key] ??= []).push({
        id: r.id,
        prompt: r.prompt,
        scheduledDate: key,
        q1: r.q1 ?? "",
        q2: r.q2 ?? "",
        q3: r.q3 ?? "",
        status: r.status,
      });
    }
    return map;
  }, [requests]);

  const handleRequestData = async (options?: RequestOptions) => {
    if (!user) return;
    const draft = await createDraft(user.uid, {
      scheduledDate: options?.prefillDate ?? null,
    });
    const mode = options?.mode ?? "create";
    let url = `/dashboard/requests/${draft.id}/setup?mode=${mode}`;
    if (options?.prefillDate) {
      url += `&date=${toDateKey(options.prefillDate)}`;
    }
    router.push(url);
  };

  const calendarProps: CalendarProps = {
    selectedDate,
    setSelectedDate,
    currentDate,
    setCurrentDate,
    requestsByDate,
  };

  const dataSectionProps: DataSectionProps = {
    selectedDate,
    requestsByDate,
    onRequestData: handleRequestData, // 🔥 CHANGED
  };

  return (
    <Requests
      calendarProps={calendarProps}
      dataSectionProps={dataSectionProps}
      onRequestData={handleRequestData} // 🔥 CHANGED
    />
  );
}
