"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import clsx from "clsx";

import {
  formatMonthYear,
  formatDayOfMonth,
  getWeekdayLabels,
  buildMonthGrid,
  addMonths,
  subMonths,
  isSameDay,
} from "../../utils/date";

interface CalendarProps {
  selectedDate: Date | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  requestsByDate: Record<string, string[]>;
}

export default function Calendar({
  selectedDate,
  setSelectedDate,
  currentDate,
  setCurrentDate,
  requestsByDate,
}: CalendarProps) {
  // Memoize: pure derivation from currentDate
  const monthCells = useMemo(() => buildMonthGrid(currentDate), [currentDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day));
  };

  return (
    <div className="w-full max-w-lg bg-white border border-gray-100 p-6 rounded-2xl self-start">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-medium text-foreground">
          {formatMonthYear(currentDate)}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-3 mb-1">
        {getWeekdayLabels().map((label) => (
          <div
            key={label}
            className="text-xs text-muted-foreground text-center py-3 uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthCells.map((cell) => {
          const isSelected =
            !!selectedDate && isSameDay(selectedDate, cell.date);

          if (!cell.inMonth) {
            return <div key={cell.key} className="aspect-square w-full" />;
          }

          const hasRequests = !!requestsByDate[cell.key]?.length;

          return (
            <button
              key={cell.key}
              onClick={() => handleDayClick(cell.date)}
              className={clsx(
                "aspect-square w-full rounded-lg text-sm flex items-center justify-center relative transition-colors",
                {
                  "bg-gray-900 text-white": isSelected,
                  "bg-gray-100 text-gray-900 border border-2 border-gray-200 hover:border-2 hover:border-gray-900":
                    cell.isToday && !isSelected, // today, not selected
                  "bg-gray-50 text-gray-900 border border-gray-100 hover:border-2 hover:border-gray-900":
                    !isSelected && !cell.isToday,
                }
              )}
            >
              <span>{formatDayOfMonth(cell.date)}</span>

              {hasRequests && (
                <span
                  className={clsx(
                    "absolute bottom-3 w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-white" : "bg-green-500"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
