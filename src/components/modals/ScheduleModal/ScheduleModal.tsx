"use client";

import { useState } from "react";
import { RRule } from "rrule";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModalShell } from "../shared/ModalShell";
import type { SchedulePattern, Frequency } from "@/lib/questions";
import { getNextDeliveryDate, FREQUENCY_LABEL } from "@/lib/questions";

// ============================================
// SCHEDULE OPTIONS (rrule-based)
// ============================================

interface ScheduleOption {
  label: string;
  rruleOptions: Partial<ConstructorParameters<typeof RRule>[0]>;
}

// Weekly options
const WEEKLY_OPTIONS: ScheduleOption[] = [
  {
    label: "Sundays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.SU },
  },
  {
    label: "Mondays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.MO },
  },
  {
    label: "Tuesdays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.TU },
  },
  {
    label: "Wednesdays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.WE },
  },
  {
    label: "Thursdays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.TH },
  },
  {
    label: "Fridays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.FR },
  },
  {
    label: "Saturdays",
    rruleOptions: { freq: RRule.WEEKLY, byweekday: RRule.SA },
  },
];

// Monthly options
const MONTHLY_OPTIONS: ScheduleOption[] = [
  {
    label: "First day of the month",
    rruleOptions: { freq: RRule.MONTHLY, bymonthday: 1 },
  },
  {
    label: "First Monday of the month",
    rruleOptions: { freq: RRule.MONTHLY, byweekday: RRule.MO, bysetpos: 1 },
  },
  {
    label: "Second Monday of the month",
    rruleOptions: { freq: RRule.MONTHLY, byweekday: RRule.MO, bysetpos: 2 },
  },
  {
    label: "Third Monday of the month",
    rruleOptions: { freq: RRule.MONTHLY, byweekday: RRule.MO, bysetpos: 3 },
  },
  {
    label: "Fourth Monday of the month",
    rruleOptions: { freq: RRule.MONTHLY, byweekday: RRule.MO, bysetpos: 4 },
  },
  {
    label: "Last day of the month",
    rruleOptions: { freq: RRule.MONTHLY, bymonthday: -1 },
  },
];

// Quarterly options (monthly with interval: 3)
// dtstart aligns to quarter boundaries (Jan 1 for Q1, Apr 1 for Q2, etc.)
const QUARTERLY_OPTIONS: ScheduleOption[] = [
  {
    label: "First day of the quarter",
    rruleOptions: {
      freq: RRule.MONTHLY,
      interval: 3,
      bymonthday: 1,
      dtstart: new Date(Date.UTC(2025, 0, 1)),
    },
  },
  {
    label: "First Monday of the quarter",
    rruleOptions: {
      freq: RRule.MONTHLY,
      interval: 3,
      byweekday: RRule.MO,
      bysetpos: 1,
      dtstart: new Date(Date.UTC(2025, 0, 1)),
    },
  },
  {
    label: "Last Monday of the quarter",
    rruleOptions: {
      freq: RRule.MONTHLY,
      interval: 3,
      byweekday: RRule.MO,
      bysetpos: -1,
      dtstart: new Date(Date.UTC(2025, 2, 1)),
    },
  },
  {
    label: "Last day of the quarter",
    rruleOptions: {
      freq: RRule.MONTHLY,
      interval: 3,
      bymonthday: -1,
      dtstart: new Date(Date.UTC(2025, 2, 1)),
    },
  },
];

// Data range options
interface DataRangeOption {
  label: string;
  days: number;
}

const DATA_RANGE_OPTIONS: DataRangeOption[] = [
  { label: "Data from the previous week", days: 7 },
  { label: "Data from the previous month", days: 30 },
  { label: "Data from the previous 2 months", days: 60 },
  { label: "Data from the previous quarter", days: 90 },
  { label: "Data from the previous 2 quarters", days: 180 },
  { label: "Data from the previous year", days: 365 },
];

function getScheduleOptions(frequency: Frequency): ScheduleOption[] {
  switch (frequency) {
    case "weekly":
      return WEEKLY_OPTIONS;
    case "monthly":
      return MONTHLY_OPTIONS;
    case "quarterly":
      return QUARTERLY_OPTIONS;
  }
}

// ============================================
// COMPONENT
// ============================================

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
  const [frequency, setFrequency] = useState<Frequency>("quarterly");
  const [optionIndex, setOptionIndex] = useState(1); // Default: First Monday of the quarter
  const [dataRangeIndex, setDataRangeIndex] = useState(3); // Default: previous quarter

  const scheduleOptions = getScheduleOptions(frequency);
  const selectedOption = scheduleOptions[optionIndex];
  const selectedDataRange = DATA_RANGE_OPTIONS[dataRangeIndex];

  // Build schedule pattern from selections
  const buildSchedule = (): SchedulePattern => {
    const rule = new RRule(
      selectedOption.rruleOptions as ConstructorParameters<typeof RRule>[0]
    );
    return {
      rrule: rule.toString(),
      frequency,
      dataRangeDays: selectedDataRange.days,
    };
  };

  // Calculate next delivery date for helper text
  const schedule = buildSchedule();
  const nextDelivery = getNextDeliveryDate(schedule);

  const handleFrequencyChange = (newFrequency: Frequency) => {
    setFrequency(newFrequency);
    setOptionIndex(0); // Reset option selection
  };

  const handleSave = () => {
    onSave?.(buildSchedule());
    onClose();
  };

  const handleCancel = () => {
    setFrequency("quarterly");
    setOptionIndex(1);
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
          {(["weekly", "monthly", "quarterly"] as Frequency[]).map((freq) => (
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
              {FREQUENCY_LABEL[freq]}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Pattern Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          When should we deliver?
        </label>
        <Select
          value={String(optionIndex)}
          onValueChange={(value) => setOptionIndex(Number(value))}
        >
          <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scheduleOptions.map((option, idx) => (
              <SelectItem key={idx} value={String(idx)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-sm text-gray-500">
          Your first answer will arrive on{" "}
          <span className="font-medium text-gray-700">
            {nextDelivery.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
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
