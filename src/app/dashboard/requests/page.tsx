"use client";

import { useState } from "react";
import { startOfToday, formatISO } from "date-fns";
import Calendar from "./Calendar";
import DataSection from "./DataSection";
import { Header } from "@/components/Header";

const SAMPLE_PROMPTS = [
  "I have an upcoming QBR with the Docusign account next Thursday. Please update the numbers in the attached deck to reflect the most recent pipeline metrics, including revenue by segment and churn data from the last quarter. Also, double-check that all charts are consistent with the latest Salesforce exports before sharing.",
  "Please review the customer feedback from last month and identify the top 3 areas for improvement. Pay close attention to recurring themes around onboarding, response time from support, and the clarity of our product documentation. Summarize the findings in a short report that I can present during next week’s leadership sync.",
];

export default function RequestsPage() {
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

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Header
        title="Requests"
        subtitle="Request data and manage your data requests in a way that aligns with your meetings and deadlines."
        buttonLabel="Request data"
        onButtonClick={handleRequestData}
        variant="black"
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-12">
        <Calendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          requestsByDate={requestsByDate}
        />

        <div className="flex-1">
          <DataSection
            selectedDate={selectedDate}
            requestsByDate={requestsByDate}
            onRequestData={handleRequestData}
          />
        </div>
      </div>
    </div>
  );
}
