"use client";

import { Header } from "@/components/blocks/Header";
import Calendar, { CalendarProps } from "./Calendar";
import DataSection, { DataSectionProps } from "./DataSection";
import type { RequestOptions } from "./RequestsClient";

interface RequestsProps {
  calendarProps: CalendarProps;
  dataSectionProps: DataSectionProps;
  onRequestData: (options?: RequestOptions) => void;
}

export function Requests({
  calendarProps,
  dataSectionProps,
  onRequestData,
}: RequestsProps) {
  return (
    <div className="h-full w-full">
      <Header
        title="Requests"
        subtitle="Request data about your customers and easily get data from all your sources."
        buttonLabel="Request data"
        onButtonClick={() => void onRequestData({})}
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
