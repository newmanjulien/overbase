"use client";

import { useState } from "react";
import { X, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (frequency: RecurringFrequency) => void;
}

export type RecurringFrequency = "weekly" | "monthly" | "quarterly";

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
}: ScheduleModalProps) {
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [dataRangeFrom, setDataRangeFrom] = useState<Date | undefined>(
    undefined
  );
  const [dataRangeTo, setDataRangeTo] = useState<Date | undefined>(undefined);

  const isReady = !!deliveryDate;

  const handleSave = () => {
    onSave?.(frequency);
    setFrequency("monthly");
    setDeliveryDate(undefined);
    setDataRangeFrom(undefined);
    setDataRangeTo(undefined);
    onClose();
  };

  const handleCancel = () => {
    setFrequency("monthly");
    setDeliveryDate(undefined);
    setDataRangeFrom(undefined);
    setDataRangeTo(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button
            type="button"
            aria-label="Close modal"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
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
              Choose the time period of data we'll use to answer your question
              the first time. We'll use the equivalent time period for future
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
                      className={
                        dataRangeFrom ? "text-gray-900" : "text-gray-400"
                      }
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
                      className={
                        dataRangeTo ? "text-gray-900" : "text-gray-400"
                      }
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <Button onClick={handleSave} disabled={!isReady}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
