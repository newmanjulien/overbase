"use client";

import { useState } from "react";

export type RecurringFrequency = "weekly" | "monthly" | "quarterly";

export function useScheduleModalState(
  onSave: ((frequency: RecurringFrequency) => void) | undefined,
  onClose: () => void
) {
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [dataRangeFrom, setDataRangeFrom] = useState<Date | undefined>(
    undefined
  );
  const [dataRangeTo, setDataRangeTo] = useState<Date | undefined>(undefined);

  const isReady = !!deliveryDate;

  const handleSave = () => {
    onSave?.(frequency);
    resetState();
    onClose();
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setFrequency("monthly");
    setDeliveryDate(undefined);
    setDataRangeFrom(undefined);
    setDataRangeTo(undefined);
  };

  return {
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
  };
}
