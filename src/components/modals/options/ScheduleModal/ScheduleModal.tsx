"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SchedulePattern, Frequency } from "@/lib/questions";
import { FREQUENCY_LABEL } from "@/lib/questions";

import { DATA_RANGE_OPTIONS } from "./constants";
import { useScheduleModalState } from "./useScheduleModalState";

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
  const {
    frequency,
    optionIndex,
    setOptionIndex,
    dataRangeIndex,
    setDataRangeIndex,
    scheduleOptions,
    nextDelivery,
    handleFrequencyChange,
    handleSave,
    handleCancel,
  } = useScheduleModalState(onClose, onSave);

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogTitle className="sr-only">Set Schedule</DialogTitle>
        <div className="-mx-4 -mt-4 h-10" />
        <div className="space-y-6">
          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              How often?
            </label>
            <div className="flex gap-2">
              {(["weekly", "monthly", "quarterly"] as Frequency[]).map(
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
                    {FREQUENCY_LABEL[freq]}
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
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
