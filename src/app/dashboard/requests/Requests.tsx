"use client";

import { Header } from "@/components/Header";
import Calendar, { CalendarProps } from "./Calendar";
import DataSection, { DataSectionProps } from "./DataSection";

interface RequestsProps {
  calendarProps: CalendarProps;
  dataSectionProps: DataSectionProps;
  onRequestData: () => void;
}

export function Requests({
  calendarProps,
  dataSectionProps,
  onRequestData,
}: RequestsProps) {
  return (
    <div className="min-h-screen">
      <Header
        title="Requests"
        subtitle="Request data and manage your data requests in a way that aligns with your meetings and deadlines."
        buttonLabel="Request data"
        onButtonClick={onRequestData}
        buttonVariant="default"
        learnMoreLink="#"
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-12">
        <Calendar {...calendarProps} />
        <div className="flex-1">
          <DataSection {...dataSectionProps} />
        </div>
      </div>
    </div>
  );
}
