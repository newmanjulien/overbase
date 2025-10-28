"use client";

import { Header } from "@/components/blocks/Header";
import Calendar, {
  CalendarProps,
} from "../../../components/layouts/CalendarSection";
import DataSection, {
  DataSectionProps,
} from "../../../components/layouts/DataSection";
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
    <div className="min-h-[calc(100vh-56px)] w-full">
      <Header
        title="Requests"
        subtitle="AI agents will gather the data then human data scientists will review it."
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
