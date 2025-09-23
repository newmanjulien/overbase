"use client";

import { useMemo, useState } from "react";
import { startOfToday, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

import type { CalendarProps } from "./Calendar";
import type { DataSectionProps } from "./DataSection";
import { Requests } from "./Requests";

import { useAuth } from "@/lib/auth";
import { useUserRequests } from "@/lib/hooks/useUserRequests";

export interface RequestItem {
  id: string;
  prompt: string;
  scheduledDate: string; // yyyy-MM-dd string for UI
  q1: string;
  q2: string;
  q3: string;
}

export default function RequestsClient() {
  const today = startOfToday();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [currentDate, setCurrentDate] = useState<Date>(today);

  const { user } = useAuth();
  const { byDate } = useUserRequests(user?.uid ?? null); // byDate: Record<string, Request[]>

  // Adapt Firestore Request[] -> UI RequestItem[]
  const requestsByDate: Record<string, RequestItem[]> = useMemo(() => {
    const out: Record<string, RequestItem[]> = {};
    for (const [key, list] of Object.entries(byDate)) {
      // key is already "yyyy-MM-dd" (local)
      out[key] = list.map((r) => ({
        id: r.id,
        prompt: r.prompt,
        scheduledDate: key, // keep exact local key to avoid timezone drift
        q1: r.q1 ?? "",
        q2: r.q2 ?? "",
        q3: r.q3 ?? "",
      }));
    }
    return out;
  }, [byDate]);

  const handleNewRequest = (prefillDate?: Date | null) => {
    const id = uuidv4();
    let url = `/dashboard/requests/${id}/setup`;
    if (prefillDate) {
      url += `?date=${format(prefillDate, "yyyy-MM-dd")}`;
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
    onRequestData: handleNewRequest,
  };

  return (
    <Requests
      calendarProps={calendarProps}
      dataSectionProps={dataSectionProps}
      onRequestData={handleNewRequest}
    />
  );
}
