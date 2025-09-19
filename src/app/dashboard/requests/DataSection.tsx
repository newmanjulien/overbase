"use client";

import { useState } from "react";
import {
  formatMonthShort,
  formatDayOfMonth,
  isBeforeToday,
  getLocalDateKey,
  isToday,
  isAfterToday,
} from "../../utils/date";
import { RowCard } from "../../../components/ui/RowCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../components/ui/toggle-group";
import clsx from "clsx";

type ViewType = "requests" | "meetings";

interface DataSectionProps {
  selectedDate: Date | null;
  requestsByDate: Record<string, string[]>;
  onRequestData: () => void;
}

// 🔹 Reusable secondary button
function SecondaryButton({
  children,
  disabled,
  onClick,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "py-2 px-4 rounded-lg text-sm transition-colors",
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50"
      )}
    >
      {children}
    </button>
  );
}

export default function DataSection({
  selectedDate,
  requestsByDate,
  onRequestData,
}: DataSectionProps) {
  const [selectedView, setSelectedView] = useState<ViewType>("requests");

  if (!selectedDate) return null;

  const dateKey = getLocalDateKey(selectedDate);
  const dataCards = requestsByDate[dateKey] || [];

  const isPastDate = isBeforeToday(selectedDate);
  const todaySelected = isToday(selectedDate);

  function renderEmptyState() {
    if (selectedView === "meetings") {
      return (
        <EmptyState
          title="Calendar not linked"
          description="Link your calendar to see your meetings"
          buttonLabel="Link calendar"
          buttonVariant="secondary"
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
        buttonVariant="secondary"
        iconType="database"
      />
    );
  }

  return (
    <div className="w-full pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg text-foreground flex items-baseline gap-2">
          <span className="font-medium">{formatMonthShort(selectedDate)}</span>
          <span>{formatDayOfMonth(selectedDate)}</span>
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
                  <SecondaryButton>Edit</SecondaryButton>
                  <SecondaryButton disabled={isAfterToday(selectedDate)}>
                    Get data
                  </SecondaryButton>
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
