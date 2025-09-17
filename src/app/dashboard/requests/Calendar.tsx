"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarProps {
  selectedDate: number | null;
  setSelectedDate: (date: number | null) => void;
  currentMonth: number;
  setCurrentMonth: (month: number) => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
}

export default function Calendar({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(
    new Date(currentYear, currentMonth)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of the month and number of days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build calendar grid
  const calendarDays: {
    day: number;
    isCurrentMonth: boolean;
    isNextMonth: boolean;
  }[] = [];

  // Prev month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isNextMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isNextMonth: false,
    });
  }

  // Next month leading days
  const remainingCells = 42 - calendarDays.length; // 6 rows × 7 cols
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isNextMonth: true,
    });
  }

  // Handlers
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
      return newDate;
    });
    setSelectedDate(null);
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      setSelectedDate(selectedDate === day ? null : day);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-foreground">
          {MONTHS[month]} {year}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-3 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-sm font-medium text-muted-foreground text-center py-3"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-3">
        {calendarDays.map((dateObj, index) => {
          const isSelected =
            dateObj.isCurrentMonth && selectedDate === dateObj.day;

          if (!dateObj.isCurrentMonth) {
            return <div key={index} className="h-16 w-16" />;
          }

          return (
            <button
              key={index}
              onClick={() =>
                handleDayClick(dateObj.day, dateObj.isCurrentMonth)
              }
              className={`
                h-16 w-16 rounded-lg text-sm font-medium transition-colors
                ${
                  isSelected
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }
              `}
            >
              {dateObj.day}
              {dateObj.day === 16 && !isSelected && (
                <div className="w-1 h-1 bg-gray-600 rounded-full mx-auto mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
