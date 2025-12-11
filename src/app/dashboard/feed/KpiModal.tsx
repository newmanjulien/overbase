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
  kpis: any[];
  setKpis: any;
}) {
  const [tempKpi, setTempKpi] = useState({
    metric: "",
    definition: "",
    antiDefinition: "",
  });

  const handleAddKpi = () => {
    if (tempKpi.metric.trim()) {
      setKpis([...kpis, tempKpi]);
      setTempKpi({ metric: "", definition: "", antiDefinition: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            Define a KPI/Metric
          </h3>
          <button type="button" aria-label="Close modal" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="KPI/Metric Name"
            value={tempKpi.metric}
            onChange={(e) => setTempKpi({ ...tempKpi, metric: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Definition"
            value={tempKpi.definition}
            onChange={(e) =>
              setTempKpi({ ...tempKpi, definition: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Anti-Definition"
            value={tempKpi.antiDefinition}
            onChange={(e) =>
              setTempKpi({ ...tempKpi, antiDefinition: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddKpi} disabled={!tempKpi.metric.trim()}>
            Add KPI
          </Button>
        </div>
      </div>
    </div>
  );
}
