"use client";

import { useState } from "react";

interface DataSectionProps {
  selectedDate: number | null;
  currentMonth: number;
  currentYear: number;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SAMPLE_PROMPTS = [
  "I have an upcoming QBR with the Docusign account. Can you update the numbers in the attached deck?",
  "Can you analyze the Q3 performance metrics and create a summary report for the leadership team?",
  "Please review the customer feedback from last month and identify the top 3 areas for improvement",
  "Generate a competitive analysis comparing our pricing strategy with the top 5 competitors",
  "Create a project timeline for the new product launch including all key milestones and dependencies",
];

export default function DataSection({
  selectedDate,
  currentMonth,
  currentYear,
}: DataSectionProps) {
  const [dataCards, setDataCards] = useState<string[]>([]);

  const handleRequestData = () => {
    const randomPrompt =
      SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setDataCards((prev) => [...prev, randomPrompt]);
  };

  const selectedDateObj = selectedDate
    ? new Date(currentYear, currentMonth, selectedDate)
    : null;
  const dayOfWeek = selectedDateObj
    ? DAYS_OF_WEEK[selectedDateObj.getDay()]
    : null;

  return (
    <div className="w-full">
      {selectedDate && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {dayOfWeek}{" "}
            <span className="font-normal">
              {selectedDate.toString().padStart(2, "0")}
            </span>
          </h2>
          {dataCards.length > 0 && (
            <button
              onClick={handleRequestData}
              className="py-3 px-6 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Request data
            </button>
          )}
        </div>
      )}

      {dataCards.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16 px-4">
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
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-left text-sm text-gray-700 leading-tight flex-1 overflow-hidden">
                  {card}
                </div>
                <div className="flex flex-col gap-2">
                  <button className="py-2 px-4 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Manage
                  </button>
                  <button className="py-2 px-4 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Repeat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
