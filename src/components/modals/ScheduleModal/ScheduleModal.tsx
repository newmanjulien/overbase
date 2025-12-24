"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ModalShell } from "../shared/ModalShell";
import {
  useScheduleModalState,
  RecurringFrequency,
} from "./useScheduleModalState";

// Re-export for consumers
export type { RecurringFrequency } from "./useScheduleModalState";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (frequency: RecurringFrequency) => void;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
}: ScheduleModalProps) {
  const {
    frequency,
    setFrequency,
    deliveryDate,
    setDeliveryDate,
    dataRangeFrom,
    setDataRangeFrom,
    dataRangeTo,
    setDataRangeTo,
    isReady,
    handleSave,
    handleCancel,
  } = useScheduleModalState(onSave, onClose);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleCancel}
      footer={
        <Button onClick={handleSave} disabled={!isReady}>
          Done
        </Button>
      }
    >
      {/* Recurring Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          How often?
        </label>
        <div className="flex gap-2">
          {(["weekly", "monthly", "quarterly"] as RecurringFrequency[]).map(
            (freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`flex-1 py-2.5 px-3 text-sm rounded-lg transition-all duration-150 ${
                  frequency === freq
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Delivery Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Receive the first answer on
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors text-left"
            >
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span
                className={deliveryDate ? "text-gray-900" : "text-gray-400"}
              >
                {deliveryDate
                  ? format(deliveryDate, "MMMM d, yyyy")
                  : "Select date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={deliveryDate}
              onSelect={setDeliveryDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Data Range */}
      <div className={!deliveryDate ? "opacity-40 select-none" : ""}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data we use to answer{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Choose the time period of data we&apos;ll use to answer your question
          the first time. We&apos;ll use the equivalent time period for future
          answers
        </p>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!deliveryDate}
                className="flex-1 flex items-center gap-3 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 disabled:hover:bg-gray-50/50 disabled:cursor-not-allowed transition-colors text-left"
              >
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span
                  className={dataRangeFrom ? "text-gray-900" : "text-gray-400"}
                >
                  {dataRangeFrom
                    ? format(dataRangeFrom, "MMM d, yyyy")
                    : "From"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataRangeFrom}
                onSelect={setDataRangeFrom}
              />
            </PopoverContent>
          </Popover>
          <span className="text-gray-400 text-sm">→</span>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!deliveryDate}
                className="flex-1 flex items-center gap-3 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 disabled:hover:bg-gray-50/50 disabled:cursor-not-allowed transition-colors text-left"
              >
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span
                  className={dataRangeTo ? "text-gray-900" : "text-gray-400"}
                >
                  {dataRangeTo ? format(dataRangeTo, "MMM d, yyyy") : "To"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dataRangeTo}
                onSelect={setDataRangeTo}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </ModalShell>
  );
}
