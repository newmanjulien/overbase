"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import type { KpiAttachment } from "../../types";

export default function KpiModal({
  isOpen,
  onClose,
  kpis,
  setKpis,
}: {
  isOpen: boolean;
  onClose: () => void;
  kpis: KpiAttachment[];
  setKpis: (kpis: KpiAttachment[]) => void;
}) {
  const [tempKpi, setTempKpi] = useState({
    metric: "",
    definition: "",
    antiDefinition: "",
  });

  const handleAddKpi = () => {
    const hasDescription =
      tempKpi.definition.trim() || tempKpi.antiDefinition.trim();
    if (tempKpi.metric.trim() && hasDescription) {
      setKpis([...kpis, { ...tempKpi }]);
      setTempKpi({ metric: "", definition: "", antiDefinition: "" });
      onClose();
    }
  };

  const isDisabled =
    !tempKpi.metric.trim() ||
    (!tempKpi.definition.trim() && !tempKpi.antiDefinition.trim());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="sr-only">Add KPI</DialogTitle>
        <div className="-mx-4 -mt-4 h-10" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              KPI or Metric Name
            </label>
            <input
              type="text"
              placeholder="e.g., Customer Acquisition Cost, Monthly Active Users"
              value={tempKpi.metric}
              onChange={(e) =>
                setTempKpi({ ...tempKpi, metric: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              How this KPI should be calculated
            </label>
            <textarea
              placeholder="How this KPI should be calculated..."
              value={tempKpi.definition}
              onChange={(e) =>
                setTempKpi({ ...tempKpi, definition: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none resize-none h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              How NOT to calculate it
            </label>
            <textarea
              placeholder="Ways this KPI is calculated which we'd need to adjust..."
              value={tempKpi.antiDefinition}
              onChange={(e) =>
                setTempKpi({ ...tempKpi, antiDefinition: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none resize-none h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddKpi}
            disabled={isDisabled}
            variant="default"
          >
            Add KPI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
