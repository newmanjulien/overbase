"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  formatMonthYear,
  formatDayOfMonth,
  formatWeekdayShort,
  getCalendarGrid,
  getWeekdays,
  getPrevMonth,
  getNextMonth,
  isSameDayCheck,
  isSameMonthCheck,
} from "../../utils/date";

interface CalendarProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  requestsByDate: Record<string, string[]>; // ✅ only requests
}

export default function Calendar({
  selectedDate,
  setSelectedDate,
  currentDate,
  setCurrentDate,
  requestsByDate,
}: CalendarProps) {
  const calendarDays = getCalendarGrid(currentDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? getPrevMonth(currentDate)
        : getNextMonth(currentDate);

    setCurrentDate(newDate);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(isSameDayCheck(selectedDate, day) ? null : day);
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-100 p-6 rounded-xl self-start">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-medium text-foreground">
          {formatMonthYear(currentDate)}
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
      <div className="grid grid-cols-7 gap-3 mb-1">
        {getWeekdays().map((day) => (
          <div
            key={formatWeekdayShort(day)}
            className="text-xs text-muted-foreground text-center py-3"
          >
            {formatWeekdayShort(day)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isSelected = isSameDayCheck(selectedDate, day);
          const inMonth = isSameMonthCheck(currentDate, day);

          if (!inMonth) {
            // 👇 Empty cell to preserve grid alignment
            return <div key={index} className="aspect-square w-full" />;
          }

          const dateKey = day.toISOString().split("T")[0];
          const hasRequests = !!requestsByDate[dateKey]?.length;

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square w-full rounded-lg text-sm transition-colors
                ${
                  isSelected
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100"
                }
              `}
            >
              {formatDayOfMonth(day)}
              {hasRequests && (
                <div
                  className={`
                    w-1 h-1 rounded-full mx-auto mt-1
                    ${isSelected ? "bg-white" : "bg-green-500"}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
