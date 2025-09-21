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
        if (!req.scheduledDate) continue; // ignore unscheduled
        if (!grouped[req.scheduledDate]) grouped[req.scheduledDate] = [];
        grouped[req.scheduledDate].push(req);
      }
      setRequestsByDate(grouped);
    }
  }, []);

  // Create new request → placeholder row → navigate to setup
  const handleNewRequest = () => {
    const id = uuidv4();
    const placeholder: RequestItem = { id, prompt: "", scheduledDate: "" };

    // Save to localStorage immediately so Setup can find it
    const stored = window.localStorage.getItem("requests");
    let all: RequestItem[] = stored ? JSON.parse(stored) : [];
    all.push(placeholder);
    window.localStorage.setItem("requests", JSON.stringify(all));

    router.push(`/dashboard/requests/${id}/setup`);
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
