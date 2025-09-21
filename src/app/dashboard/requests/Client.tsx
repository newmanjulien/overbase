"use client";

import { useState } from "react";
import { startOfToday, formatISO } from "date-fns";
import type { CalendarProps } from "./Calendar";
import type { DataSectionProps } from "./DataSection";
import { Requests } from "./Requests";

const SAMPLE_PROMPTS = [
  "I have an upcoming QBR with the Docusign account next Thursday. Please update the numbers...",
  "Please review the customer feedback from last month and identify the top 3 areas for improvement...",
];

export default function RequestsClient() {
  const today = startOfToday();

  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [requestsByDate, setRequestsByDate] = useState<
    Record<string, string[]>
  >({});

  const handleRequestData = () => {
    if (!selectedDate) return;

    const randomPrompt =
      SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    const dateKey = formatISO(selectedDate, { representation: "date" });

    setRequestsByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), randomPrompt],
    }));
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
    onRequestData: handleRequestData,
  };

  return (
    <Requests
      calendarProps={calendarProps}
      dataSectionProps={dataSectionProps}
      onRequestData={handleRequestData}
    />
  );
}
