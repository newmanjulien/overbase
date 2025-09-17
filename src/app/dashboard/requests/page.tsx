"use client";

import { useState } from "react";
import Calendar from "./Calendar";
import DataSection from "./DataSection";
import { Header } from "../../../components/ui/Header";

export default function RequestsPage() {
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Section Header */}
      <Header
        title="Requests"
        subtitle="Track and manage data requests across your workflows."
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-10">
        {/* Left column - Calendar */}
        <Calendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
        />

        {/* Right column - Data Section */}
        <div className="flex-1">
          <DataSection
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        </div>
      </div>
    </div>
  );
}
