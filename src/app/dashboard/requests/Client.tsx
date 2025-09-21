"use client";

import { useState, useEffect } from "react";
import { startOfToday } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

import type { CalendarProps } from "./Calendar";
import type { DataSectionProps } from "./DataSection";
import { Requests } from "./Requests";

export interface RequestItem {
  id: string;
  prompt: string;
  scheduledDate: string;
  q1: string;
  q2: string;
  q3: string;
}

export default function RequestsClient() {
  const today = startOfToday();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [requestsByDate, setRequestsByDate] = useState<
    Record<string, RequestItem[]>
  >({});

  // 🔑 Hydrate from localStorage on mount
  useEffect(() => {
    const stored = window.localStorage.getItem("requests");
    if (stored) {
      const all: RequestItem[] = JSON.parse(stored);

      const grouped: Record<string, RequestItem[]> = {};
      for (const req of all) {
        if (!req.scheduledDate) continue;
        if (!grouped[req.scheduledDate]) grouped[req.scheduledDate] = [];
        grouped[req.scheduledDate].push(req);
      }
      setRequestsByDate(grouped);
    }
  }, []);

  // ✅ Single handler for new requests
  const handleNewRequest = (prefillDate?: Date | null) => {
    const id = uuidv4();
    const placeholder: RequestItem = {
      id,
      prompt: "",
      scheduledDate: prefillDate ? prefillDate.toISOString().split("T")[0] : "",
      q1: "",
      q2: "",
      q3: "",
    };

    const stored = window.localStorage.getItem("requests");
    let all: RequestItem[] = stored ? JSON.parse(stored) : [];
    all.push(placeholder);
    window.localStorage.setItem("requests", JSON.stringify(all));

    let url = `/dashboard/requests/${id}/setup`;
    if (prefillDate) {
      url += `?date=${placeholder.scheduledDate}`;
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
    onRequestData: handleNewRequest, // ✅ aligned
  };

  return (
    <Requests
      calendarProps={calendarProps}
      dataSectionProps={dataSectionProps}
      onRequestData={handleNewRequest} // ✅ aligned
    />
  );
}
