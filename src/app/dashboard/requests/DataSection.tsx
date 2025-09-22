"use client";

import { useState, useMemo } from "react";
import { format, formatISO, isBefore, startOfToday, isToday } from "date-fns";
import { RowCard } from "@/components/blocks/RowCard";
import { EmptyState } from "@/components/blocks/EmptyState";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

import type { RequestItem } from "./Client";
import Link from "next/link";

type ViewType = "requests" | "meetings";

export interface DataSectionProps {
  selectedDate?: Date | null;
  requestsByDate: Record<string, RequestItem[]>;
  onRequestData: (prefillDate?: Date | null) => void;
}

export default function DataSection({
  selectedDate,
  requestsByDate,
  onRequestData,
}: DataSectionProps) {
  const [selectedView, setSelectedView] = useState<ViewType>("requests");

  // Always call hooks before any conditional return
  const { dataCards, isPastDate, todaySelected, isFutureDate } = useMemo(() => {
    if (!selectedDate) {
      return {
        dataCards: [] as RequestItem[],
        isPastDate: false,
        todaySelected: false,
        isFutureDate: false,
      };
    }

    const key = formatISO(selectedDate, { representation: "date" });
    const cards: RequestItem[] = requestsByDate[key] || [];
    const past = isBefore(selectedDate, startOfToday());
    const today = isToday(selectedDate);
    const future = isBefore(startOfToday(), selectedDate);

    return {
      dataCards: cards,
      isPastDate: past,
      todaySelected: today,
      isFutureDate: future,
    };
  }, [selectedDate, requestsByDate]);

  const sortedRequests = useMemo(() => {
    return [...dataCards];
  }, [dataCards]);

  if (!selectedDate) return null;

  function renderEmptyState() {
    if (selectedView === "meetings") {
      return (
        <EmptyState
          title="Calendar not linked"
          description="Link your calendar to see your meetings"
          buttonLabel="Link calendar"
          buttonVariant="outline"
          onButtonClick={() => {}}
          iconType="calendar"
        />
      );
    }

    if (isPastDate) {
      return (
        <EmptyState
          title="No data received"
          description="You did not receive any data on this day"
          iconType="database"
        />
      );
    }

    if (todaySelected) {
      return (
        <EmptyState
          title="No data today"
          description="You did not receive any data today"
          iconType="database"
        />
      );
    }

    return (
      <EmptyState
        title="No data requested"
        description="You have not requested any data yet for this day"
        buttonLabel="Request data"
        buttonVariant="outline"
        iconType="database"
        onButtonClick={() => onRequestData(selectedDate)}
      />
    );
  }

  return (
    <div className="w-full pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-foreground flex items-baseline gap-1">
          <span className="text-lg font-medium">
            {format(selectedDate, "MMM")}
          </span>
          <span>{format(selectedDate, "d")}</span>
        </h2>

        <ToggleGroup
          type="single"
          value={selectedView}
          onValueChange={(val) => val && setSelectedView(val as ViewType)}
          variant="outline"
        >
          <ToggleGroupItem value="requests">Requests</ToggleGroupItem>
          <ToggleGroupItem value="meetings">Meetings</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {selectedView === "requests" && sortedRequests.length > 0 ? (
        <div className="space-y-3">
          {sortedRequests.map((req) => (
            <RowCard
              key={req.id}
              contentBox={req.prompt || "No prompt provided"}
              actions={
                <>
                  <Link href={`/dashboard/requests/${req.id}/setup`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  <Button variant="secondary" disabled={isFutureDate}>
                    Get data
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
}
