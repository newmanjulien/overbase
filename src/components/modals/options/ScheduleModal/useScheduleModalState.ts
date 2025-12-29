import { useState } from "react";
import { RRule } from "rrule";
import type { SchedulePattern, Frequency } from "@/lib/questions";
import { getNextDeliveryDate } from "@/lib/questions";
import { DATA_RANGE_OPTIONS, getScheduleOptions } from "./constants";

export function useScheduleModalState(
  onClose: () => void,
  onSave?: (schedule: SchedulePattern) => void
) {
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [optionIndex, setOptionIndex] = useState(1); // Default: First Monday of the month
  const [dataRangeIndex, setDataRangeIndex] = useState(1); // Default: previous month

  const scheduleOptions = getScheduleOptions(frequency);
  const selectedOption = scheduleOptions[optionIndex];
  const selectedDataRange = DATA_RANGE_OPTIONS[dataRangeIndex];

  // Build schedule pattern from selections
  const buildSchedule = (): SchedulePattern => {
    // Fallback if index is out of bounds (shouldn't happen with correct usage but good for safety)
    const option = selectedOption || scheduleOptions[0];
    const dataRange = selectedDataRange || DATA_RANGE_OPTIONS[0];

    const rule = new RRule(
      option.rruleOptions as ConstructorParameters<typeof RRule>[0]
    );
    return {
      rrule: rule.toString(),
      frequency,
      dataRangeDays: dataRange.days,
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
    // Reset to defaults on cancel (retaining original behavior)
    setFrequency("monthly");
    setOptionIndex(1);
    setDataRangeIndex(1);
    onClose();
  };

  return {
    frequency,
    setFrequency, // Exposed if needed, but handleFrequencyChange is preferred
    optionIndex,
    setOptionIndex,
    dataRangeIndex,
    setDataRangeIndex,
    scheduleOptions,
    selectedOption,
    nextDelivery,
    handleFrequencyChange,
    handleSave,
    handleCancel,
  };
}
