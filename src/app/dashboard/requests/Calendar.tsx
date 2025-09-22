"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import type { RequestItem } from "./Client";

import {
  format,
  formatISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";

interface MonthCell {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
}

function getLocalDateKey(date: Date): string {
  return formatISO(date, { representation: "date" });
}

function buildMonthGrid(date: Date): MonthCell[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  while (days.length < 42) {
    days.push(addDays(days[days.length - 1], 1));
  }

  return days.map((d) => ({
    date: d,
    key: getLocalDateKey(d),
    inMonth: isSameMonth(date, d),
    isToday: isToday(d),
  }));
}

function getWeekdayLabels(): string[] {
  const WEEK_REF = new Date(2000, 0, 2); // Sunday
  const start = startOfWeek(WEEK_REF, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "EEE"));
}

function getDayButtonClasses({
  isSelected,
  isToday,
}: {
  isSelected: boolean;
  isToday: boolean;
}) {
  return clsx(
    "aspect-square w-full rounded-lg text-sm flex items-center justify-center relative transition-colors",
    {
      "bg-gray-900 text-white": isSelected,
      "bg-gray-100 text-gray-900 border border-2 border-gray-200 hover:border-2 hover:border-gray-900":
        isToday && !isSelected,
      "bg-gray-50 text-gray-900 border border-gray-100 hover:border-2 hover:border-gray-900":
        !isSelected && !isToday,
    }
  );
}

function getRequestIndicatorClasses(isSelected: boolean) {
  return clsx(
    "absolute bottom-3 size-1.5 rounded-full",
    isSelected ? "bg-white" : "bg-green-500"
  );
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
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day));
  };

  return (
    <div className="w-full max-w-lg bg-white border border-gray-100 p-8 rounded-3xl self-start">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg text-foreground flex items-baseline gap-1">
          <span className="text-lg font-medium">
            {format(currentDate, "MMMM")}
          </span>
          <span className="text-foreground/60">
            {format(currentDate, "yyyy")}
          </span>
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

          const hasRequests = !!requestsByDate?.[cell.key]?.length;

          return (
            <button
              key={cell.key}
              onClick={() => handleDayClick(cell.date)}
              className={getDayButtonClasses({
                isSelected,
                isToday: cell.isToday,
              })}
            >
              <span>{format(cell.date, "d")}</span>

              {hasRequests && (
                <span className={getRequestIndicatorClasses(isSelected)} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
