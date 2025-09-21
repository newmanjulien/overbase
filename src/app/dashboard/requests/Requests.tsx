"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import Calendar, { CalendarProps } from "./Calendar";
import DataSection, { DataSectionProps } from "./DataSection";

interface RequestsProps {
  calendarProps: CalendarProps;
  dataSectionProps: DataSectionProps;
}

export function Requests({ calendarProps, dataSectionProps }: RequestsProps) {
  const router = useRouter();

  const onRequestData = (prefillDate?: Date) => {
    const id = "new"; // 👈 or however you generate/request IDs
    let url = `/dashboard/requests/${id}/setup`;
    if (prefillDate) {
      url += `?date=${prefillDate.toISOString().split("T")[0]}`;
    }
    router.push(url);
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Requests"
        subtitle="Request data and manage your data requests in a way that aligns with your meetings and deadlines."
        buttonLabel="Request data"
        onButtonClick={() => onRequestData(undefined)} // 👈 no prefill
        buttonVariant="default"
        learnMoreLink="#"
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-12">
        <Calendar {...calendarProps} />
        <div className="flex-1">
          <DataSection
            {...dataSectionProps}
            onRequestData={onRequestData} // 👈 pass handler down
          />
        </div>
      </div>
    </div>
  );
}
