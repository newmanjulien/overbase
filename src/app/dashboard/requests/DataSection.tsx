"use client";

import { useState } from "react";
import { formatDayLabel, isBeforeToday } from "../../utils/date";
import { RowCard } from "../../../components/ui/RowCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Calendar, Database } from "lucide-react";

interface DataSectionProps {
  selectedDate: Date | null;
  requestsByDate: Record<string, string[]>;
  setRequestsByDate: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
}

const SAMPLE_PROMPTS = [
  "I have an upcoming QBR with the Docusign account. Can you update the numbers in the attached deck?",
  "Can you analyze the Q3 performance metrics and create a summary report for the leadership team?",
  "Please review the customer feedback from last month and identify the top 3 areas for improvement",
  "Generate a competitive analysis comparing our pricing strategy with the top 5 competitors",
  "Create a project timeline for the new product launch including key milestones and dependencies",
];

export default function DataSection({
  selectedDate,
  requestsByDate,
  setRequestsByDate,
}: DataSectionProps) {
  const [selectedView, setSelectedView] = useState<"requests" | "meetings">(
    "requests"
  );

  if (!selectedDate) return null;

  const dateKey = selectedDate.toISOString().split("T")[0];
  const dataCards = requestsByDate[dateKey] || [];

  const handleRequestData = () => {
    const randomPrompt =
      SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setRequestsByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), randomPrompt],
    }));
  };

  // Split weekday and day number (e.g. "Fri 05")
  const label = formatDayLabel(selectedDate);
  const [weekday, dayNumber] = label.split(" ");

  // Check if the selected date is in the past
  const isPastDate = isBeforeToday(selectedDate);

  return (
    <div className="w-full pt-4">
      <>
        {/* Date + Selector */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-foreground flex items-baseline gap-1">
            <span className="font-medium">{weekday}</span>
            <span>{dayNumber}</span>
          </h2>
          <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
            {(["requests", "meetings"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  selectedView === view
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {selectedView === "requests" ? (
          dataCards.length === 0 ? (
            isPastDate ? (
              <EmptyState
                title="No data received"
                description="You did not receive any data on this day"
                withBorder={false}
                icon={<Database className="w-10 h-10 text-gray-600" />}
              />
            ) : (
              <EmptyState
                title="No data requested"
                description="You have not requested any data yet for this day"
                buttonLabel="Request data"
                onButtonClick={handleRequestData}
                buttonVariant="secondary"
                withBorder={false}
                icon={<Database className="w-10 h-10 text-gray-600" />}
              />
            )
          ) : (
            <div className="space-y-6">
              {dataCards.map((card, index) => (
                <RowCard
                  key={index}
                  contentBox={card}
                  actions={
                    <>
                      <button className="py-2 px-4 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Edit
                      </button>
                      <button
                        disabled={isPastDate}
                        className={`py-2 px-4 rounded-lg text-sm transition-colors ${
                          isPastDate
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Get data
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            title="Calendar not linked"
            description="Link your calendar to see your meetings"
            buttonLabel="Link calendar"
            buttonVariant="secondary"
            onButtonClick={() => {}}
            withBorder={false}
            icon={<Calendar className="w-10 h-10 text-gray-600" />}
          />
        )}
      </>
    </div>
  );
}
