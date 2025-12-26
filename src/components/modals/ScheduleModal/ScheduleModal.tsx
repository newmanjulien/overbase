"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModalShell } from "../shared/ModalShell";
import type { SchedulePattern } from "@/lib/questions";
import { getNextDeliveryDate } from "@/lib/questions";
import { format } from "date-fns";

// Dropdown option types
interface DeliveryOption {
  label: string;
  value: Partial<SchedulePattern>;
}

interface DataRangeOption {
  label: string;
  days: number;
}

// Weekly options
const WEEKLY_OPTIONS: DeliveryOption[] = [
  { label: "Sundays", value: { dayOfWeek: 0 } },
  { label: "Mondays", value: { dayOfWeek: 1 } },
  { label: "Tuesdays", value: { dayOfWeek: 2 } },
  { label: "Wednesdays", value: { dayOfWeek: 3 } },
  { label: "Thursdays", value: { dayOfWeek: 4 } },
  { label: "Fridays", value: { dayOfWeek: 5 } },
  { label: "Saturdays", value: { dayOfWeek: 6 } },
];

// Monthly options
const MONTHLY_OPTIONS: DeliveryOption[] = [
  { label: "First day of the month", value: { dayOfMonth: 1 } },
  { label: "First Monday of the month", value: { nthWeek: 1, dayOfWeek: 1 } },
  { label: "Second Monday of the month", value: { nthWeek: 2, dayOfWeek: 1 } },
  { label: "Third Monday of the month", value: { nthWeek: 3, dayOfWeek: 1 } },
  { label: "Fourth Monday of the month", value: { nthWeek: 4, dayOfWeek: 1 } },
  { label: "Last day of the month", value: { dayOfMonth: -1 } },
];

// Quarterly options
const QUARTERLY_OPTIONS: DeliveryOption[] = [
  { label: "First day of the quarter", value: { quarterDay: "first" } },
  {
    label: "First Monday of the quarter",
    value: { quarterWeekday: "first-monday" },
  },
  {
    label: "First day of the second month",
    value: { quarterDay: "second-month-first" },
  },
  {
    label: "First day of the third month",
    value: { quarterDay: "third-month-first" },
  },
  {
    label: "Last Monday of the quarter",
    value: { quarterWeekday: "last-monday" },
  },
  { label: "Last day of the quarter", value: { quarterDay: "last" } },
];

// Data range options
const DATA_RANGE_OPTIONS: DataRangeOption[] = [
  { label: "Data from the previous week", days: 7 },
  { label: "Data from the previous month", days: 30 },
  { label: "Data from the previous 2 months", days: 60 },
  { label: "Data from the previous quarter", days: 90 },
  { label: "Data from the previous 2 quarters", days: 180 },
  { label: "Data from the previous year", days: 365 },
];

function getDeliveryOptions(
  frequency: "weekly" | "monthly" | "quarterly"
): DeliveryOption[] {
  switch (frequency) {
    case "weekly":
      return WEEKLY_OPTIONS;
    case "monthly":
      return MONTHLY_OPTIONS;
    case "quarterly":
      return QUARTERLY_OPTIONS;
  }
}

export type RecurringFrequency = "weekly" | "monthly" | "quarterly";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (schedule: SchedulePattern) => void;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
}: ScheduleModalProps) {
  const [frequency, setFrequency] = useState<RecurringFrequency>("quarterly");
  const [deliveryIndex, setDeliveryIndex] = useState(1); // Default: First Monday of the quarter
  const [dataRangeIndex, setDataRangeIndex] = useState(3); // Default: previous quarter

  const deliveryOptions = getDeliveryOptions(frequency);
  const selectedDelivery = deliveryOptions[deliveryIndex];
  const selectedDataRange = DATA_RANGE_OPTIONS[dataRangeIndex];

  // Build schedule pattern from selections
  const buildSchedule = (): SchedulePattern => ({
    frequency,
    ...selectedDelivery.value,
    dataRangeDays: selectedDataRange.days,
  });

  // Calculate next delivery date for helper text
  const schedule = buildSchedule();
  const nextDelivery = getNextDeliveryDate(schedule);

  const handleFrequencyChange = (newFrequency: RecurringFrequency) => {
    setFrequency(newFrequency);
    setDeliveryIndex(0); // Reset delivery selection
  };

  const handleSave = () => {
    onSave?.(buildSchedule());
    onClose();
  };

  const handleCancel = () => {
    setFrequency("quarterly");
    setDeliveryIndex(1);
    setDataRangeIndex(3);
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleCancel}
      footer={<Button onClick={handleSave}>Done</Button>}
    >
      {/* Frequency Selection */}
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
                onClick={() => handleFrequencyChange(freq)}
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

      {/* Delivery Pattern Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          When should we deliver?
        </label>
        <Select
          value={String(deliveryIndex)}
          onValueChange={(value) => setDeliveryIndex(Number(value))}
        >
          <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {deliveryOptions.map((option, idx) => (
              <SelectItem key={idx} value={String(idx)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-sm text-gray-500">
          Your first answer will arrive on{" "}
          <span className="font-medium text-gray-700">
            {format(nextDelivery, "EEEE, MMMM d")}
          </span>
        </p>
      </div>

      {/* Data Range Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What data should we use?
        </label>
        <Select
          value={String(dataRangeIndex)}
          onValueChange={(value) => setDataRangeIndex(Number(value))}
        >
          <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATA_RANGE_OPTIONS.map((option, idx) => (
              <SelectItem key={idx} value={String(idx)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ModalShell>
  );
}
