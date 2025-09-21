"use client";

import { useState, useMemo } from "react";
import { format, formatISO, isBefore, startOfToday, isToday } from "date-fns";
import { RowCard } from "@/components/RowCard";
import { EmptyState } from "@/components/EmptyState";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

import type { RequestItem } from "./Client";

type ViewType = "requests" | "meetings";

export interface DataSectionProps {
  selectedDate: Date | null;
  requestsByDate: Record<string, RequestItem[]>;
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
  const dataCards: RequestItem[] = requestsByDate[dateKey] || [];

  const isPastDate = isBefore(selectedDate, startOfToday());
  const todaySelected = isToday(selectedDate);

  const sortedRequests = useMemo(() => {
    // Keep order but ensure new items are at the bottom
    return [...dataCards];
  }, [dataCards]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <ToggleGroup
          type="single"
          value={selectedView}
          onValueChange={(val) => val && setSelectedView(val as ViewType)}
        >
          <ToggleGroupItem value="requests">Requests</ToggleGroupItem>
          <ToggleGroupItem value="meetings">Meetings</ToggleGroupItem>
        </ToggleGroup>

        <Button onClick={onRequestData} variant="default">
          Request Data
        </Button>
      </div>

      {sortedRequests.length === 0 ? (
        <EmptyState
          title="No requests"
          description="..."
          buttonLabel="Request Data"
          onButtonClick={onRequestData}
          iconType="database"
        />
      ) : (
        <div className="space-y-3">
          {sortedRequests.map((req) => (
            <RowCard
              key={req.id}
              id={req.id}
              title={req.prompt || "Untitled Request"}
              subtitle={
                req.scheduledDate
                  ? `Scheduled for ${format(
                      new Date(req.scheduledDate),
                      "PPP"
                    )}`
                  : "No scheduled date"
              }
              showAvatar={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
