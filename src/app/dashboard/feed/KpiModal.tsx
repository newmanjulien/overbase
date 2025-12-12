// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { X, BarChart3 } from "lucide-react";

// export default function KpiModal({
//   isOpen,
//   onClose,
//   kpis,
//   setKpis,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   kpis: any[];
//   setKpis: any;
// }) {
//   const [tempKpi, setTempKpi] = useState({
//     metric: "",
//     definition: "",
//     antiDefinition: "",
//   });

//   const handleAddKpi = () => {
//     if (tempKpi.metric.trim()) {
//       setKpis([...kpis, tempKpi]);
//       setTempKpi({ metric: "", definition: "", antiDefinition: "" });
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
//       <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 p-4">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold flex items-center gap-2">
//             <BarChart3 className="h-5 w-5 text-amber-600" />
//             Define a KPI/Metric
//           </h3>
//           <button type="button" aria-label="Close modal" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <input
//             type="text"
//             placeholder="KPI/Metric Name"
//             value={tempKpi.metric}
//             onChange={(e) => setTempKpi({ ...tempKpi, metric: e.target.value })}
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//           <textarea
//             placeholder="Definition"
//             value={tempKpi.definition}
//             onChange={(e) =>
//               setTempKpi({ ...tempKpi, definition: e.target.value })
//             }
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//           <textarea
//             placeholder="Anti-Definition"
//             value={tempKpi.antiDefinition}
//             onChange={(e) =>
//               setTempKpi({ ...tempKpi, antiDefinition: e.target.value })
//             }
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>

//         <div className="mt-4 flex justify-end gap-3">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleAddKpi} disabled={!tempKpi.metric.trim()}>
//             Add KPI
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

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
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            Define a KPI/Metric
          </h3>
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
              Metric/KPI Name
            </label>
            <input
              type="text"
              placeholder="e.g., Customer Acquisition Cost, Monthly Active Users"
              value={tempKpi.metric}
              onChange={(e) =>
                setTempKpi({ ...tempKpi, metric: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-1.5">
              How to define it
            </label>
            <textarea
              placeholder="Describe how this metric should be calculated or defined..."
              value={tempKpi.definition}
              onChange={(e) =>
                setTempKpi({ ...tempKpi, definition: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-green-200 bg-green-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-700 mb-1.5">
              How NOT to define it
            </label>
            <textarea
              placeholder="Describe what should NOT be included or common mistakes to avoid..."
              value={tempKpi.antiDefinition}
              onChange={(e) =>
                setTempKpi({ ...tempKpi, antiDefinition: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-red-200 bg-red-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-24"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddKpi}
            disabled={!tempKpi.metric.trim()}
            className="bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Add KPI
          </Button>
        </div>
      </div>
    </div>
  );
}
