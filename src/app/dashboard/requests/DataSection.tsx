"use client";

import { useState } from "react";
import { format, formatISO, isBefore, startOfToday, isToday } from "date-fns";
import { RowCard } from "@/components/RowCard";
import { EmptyState } from "@/components/EmptyState";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

type ViewType = "requests" | "meetings";

export interface DataSectionProps {
  selectedDate: Date | null;
  requestsByDate: Record<string, string[]>;
  onRequestData: () => void;
}

export default function DataSection({
  selectedDate,
  requestsByDate,
  onRequestData,
}: DataSectionProps) {
  const [selectedView, setSelectedView] = useState<ViewType>("requests");

  if (!selectedDate) return null;

  const dateKey = formatISO(selectedDate, { representation: "date" });
  const dataCards = requestsByDate[dateKey] || [];

  const isPastDate = isBefore(selectedDate, startOfToday());
  const todaySelected = isToday(selectedDate);
  const isFutureDate = isBefore(startOfToday(), selectedDate);

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
        onButtonClick={onRequestData}
        buttonVariant="outline"
        iconType="database"
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
          onValueChange={(val) => {
            if (val === "requests" || val === "meetings") {
              setSelectedView(val);
            }
          }}
          variant="outline"
        >
          <ToggleGroupItem value="requests">Requests</ToggleGroupItem>
          <ToggleGroupItem value="meetings">Meetings</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {selectedView === "requests" && dataCards.length > 0 ? (
        <div className="space-y-6">
          {dataCards.map((card, index) => (
            <RowCard
              key={index}
              contentBox={card}
              actions={
                <>
                  <Button variant="secondary">Edit</Button>
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
