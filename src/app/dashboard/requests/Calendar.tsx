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
    setSelectedDate(null);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(isSameDayCheck(selectedDate, day) ? null : day);
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg self-start">
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

          // ✅ Only requests matter for dots
          const dateKey = day.toISOString().split("T")[0];
          const hasRequests = !!requestsByDate[dateKey]?.length;

          return (
            <button
              key={index}
              onClick={() => inMonth && handleDayClick(day)}
              className={`
                aspect-square w-full rounded-lg text-sm transition-colors
                ${
                  isSelected
                    ? "bg-gray-800 text-white"
                    : inMonth
                    ? "bg-gray-100 text-gray-900 hover:bg-gray-300"
                    : "bg-transparent"
                }
              `}
            >
              {formatDayOfMonth(day)}
              {hasRequests && inMonth && (
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
