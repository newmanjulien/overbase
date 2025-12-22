"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, BarChart3 } from "lucide-react";

export default function KpiModal({
  isOpen,
  onClose,
  kpis,
  setKpis,
}: {
  isOpen: boolean;
  onClose: () => void;
  kpis: Array<{ metric: string; definition: string; antiDefinition: string }>;
  setKpis: any;
}) {
  const [tempKpi, setTempKpi] = useState({
    metric: "",
    definition: "",
    antiDefinition: "",
  });

  const handleAddKpi = () => {
    if (tempKpi.metric.trim()) {
      setKpis([...kpis, { ...tempKpi }]);
      setTempKpi({ metric: "", definition: "", antiDefinition: "" });
      onClose();
    }
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
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
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

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <Button
            onClick={handleAddKpi}
            disabled={!tempKpi.metric.trim()}
            variant="default"
          >
            Add KPI
          </Button>
        </div>
      </div>
    </div>
  );
}
