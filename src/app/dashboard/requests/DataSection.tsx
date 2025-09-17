"use client";

import { formatDayLabel } from "../../utils/date";
import { RowCard } from "../../../components/ui/RowCard";

interface DataSectionProps {
  selectedDate: Date | null;
  requestsByDate: Record<string, string[]>;
  setRequestsByDate: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
}

const SAMPLE_PROMPTS = [
  "I have an upcoming QBR with the Docusign account. Can you update the numbers in the attached deck? I have an upcoming QBR with the Docusign account. Can you update the numbers in the attached deck?",
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

  return (
    <div className="w-full pt-4">
      <>
        {/* Date + Selector */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-foreground">
            {formatDayLabel(selectedDate)}
          </h2>
        </div>

        {/* Content */}
        {dataCards.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center px-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0V7a1 1 0 00-1 1v9a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1h-1"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No data requested
            </h3>
            <p className="text-gray-500 text-center mb-8 max-w-sm">
              You have no data requested yet. Your requested data will show up
              here.
            </p>
            <button
              onClick={handleRequestData}
              className="py-3 px-6 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Request data
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {dataCards.map((card, index) => (
              <RowCard
                key={index}
                contentBox={card}
                actions={
                  <>
                    <button className="py-2 px-4 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Manage
                    </button>
                    <button className="py-2 px-4 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      View
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </>
    </div>
  );
}
