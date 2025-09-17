"use client";

import { useState } from "react";
import Calendar from "./Calendar";
import DataSection from "./DataSection";
import { Header } from "../../../components/ui/Header";

export default function RequestsPage() {
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [currentDate, setCurrentDate] = useState<Date>(today);

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
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />

        {/* Right column - Data Section */}
        <div className="flex-1">
          <DataSection selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}
