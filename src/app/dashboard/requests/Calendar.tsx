"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import type { RequestItem } from "./RequestsClient";

import { addMonths, subMonths } from "date-fns";
import {
  buildMonthGrid,
  getWeekdayLabels,
  formatMonth,
  formatYear,
  formatDayNumber,
  isSameDayDate,
} from "@/lib/requestDates";

function getDayButtonClasses({
  isSelected,
  isToday,
}: {
  isSelected: boolean;
  isToday: boolean;
}) {
  return clsx(
    "aspect-square w-full rounded-lg text-sm flex items-center justify-center relative transition-colors border-2",
    {
      "bg-gray-900 text-white border-gray-900": isSelected,
      "bg-gray-100 text-gray-900 border-gray-200 hover:border-gray-900":
        isToday && !isSelected,
      "bg-gray-50 text-gray-900 border-gray-100 hover:border-gray-900":
        !isSelected && !isToday,
    }
  );
}

function getRequestIndicatorClasses(hasActive: boolean, hasDraft: boolean) {
  const colorClass = hasActive ? "bg-green-500" : hasDraft ? "bg-gray-400" : "";
  return clsx("absolute bottom-3 size-1.5 rounded-full", colorClass);
}

export interface CalendarProps {
  selectedDate: Date | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  requestsByDate: Record<string, RequestItem[]>;
}

export default function Calendar({
  selectedDate,
  setSelectedDate,
  currentDate,
  setCurrentDate,
  requestsByDate,
}: CalendarProps) {
  const monthCells = useMemo(() => buildMonthGrid(currentDate), [currentDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate((prev) => {
      if (prev && isSameDayDate(prev, day)) {
        // Do nothing if user clicks the same day
        return prev;
      }
      return day;
    });
  };

  return (
    <div className="w-full max-w-lg bg-white border border-gray-100 p-8 rounded-3xl self-start">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg text-foreground flex items-baseline gap-1">
          <span className="text-lg font-medium">
            {formatMonth(currentDate)}
          </span>
          <span className="text-foreground/60">{formatYear(currentDate)}</span>
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
            !!selectedDate && isSameDayDate(selectedDate, cell.date);

          if (!cell.inMonth) {
            return <div key={cell.key} className="aspect-square w-full" />;
          }

          const list = requestsByDate?.[cell.key] ?? [];
          const hasActive = list.some((r) => r.status === "active");
          const hasDraft = list.some((r) => r.status === "draft");
          const hasRequests = list.length > 0;

          return (
            <button
              key={cell.key}
              onClick={() => handleDayClick(cell.date)}
              className={getDayButtonClasses({
                isSelected,
                isToday: cell.isToday,
              })}
            >
              <span>{formatDayNumber(cell.date)}</span>

              {hasRequests && (
                <span
                  className={getRequestIndicatorClasses(hasActive, hasDraft)}
                  aria-label={
                    hasActive
                      ? "Active requests"
                      : hasDraft
                      ? "Draft requests"
                      : undefined
                  }
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
