// "use client";

// import { Button } from "@/components/ui/button";
// import { X, Users } from "lucide-react";
// import { useState } from "react";

// export default function ColleagueModal({
//   isOpen,
//   onClose,
//   colleagues,
//   setColleagues,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   colleagues: any[];
//   setColleagues: any;
// }) {
//   const [tempColleague, setTempColleague] = useState({
//     name: "",
//     infoNeeded: "",
//   });

//   const handleAddColleague = () => {
//     if (tempColleague.name.trim()) {
//       setColleagues([...colleagues, tempColleague]);
//       setTempColleague({ name: "", infoNeeded: "" });
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
//       <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 p-4">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold flex items-center gap-2">
//             <Users className="h-5 w-5 text-violet-600" />
//             Link a Colleague
//           </h3>
//           <button type="button" aria-label="Close modal" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <input
//             type="text"
//             placeholder="Colleague Name or Email"
//             value={tempColleague.name}
//             onChange={(e) =>
//               setTempColleague({ ...tempColleague, name: e.target.value })
//             }
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//           <textarea
//             placeholder="What information do you need from them?"
//             value={tempColleague.infoNeeded}
//             onChange={(e) =>
//               setTempColleague({ ...tempColleague, infoNeeded: e.target.value })
//             }
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>

//         <div className="mt-4 flex justify-end gap-3">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleAddColleague}
//             disabled={!tempColleague.name.trim()}
//           >
//             Add Colleague
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { X, Users } from "lucide-react";
import { useState } from "react";

export default function ColleagueModal({
  isOpen,
  onClose,
  colleagues,
  setColleagues,
}: {
  isOpen: boolean;
  onClose: () => void;
  colleagues: any[];
  setColleagues: any;
}) {
  const [tempColleague, setTempColleague] = useState({
    name: "",
    infoNeeded: "",
  });

  const handleAddColleague = () => {
    if (tempColleague.name.trim()) {
      setColleagues([...colleagues, { ...tempColleague }]);
      setTempColleague({ name: "", infoNeeded: "" });
      onClose();
    }
  };

  const closeModal = () => {
    setTempColleague({ name: "", infoNeeded: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-600" />
            Link a Colleague
          </h3>
          <button
            type="button"
            aria-label="Close modal"
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Colleague Name or Email
            </label>
            <input
              type="text"
              placeholder="e.g., John Smith or john@company.com"
              value={tempColleague.name}
              onChange={(e) =>
                setTempColleague({ ...tempColleague, name: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              What information do you need from them?
            </label>
            <textarea
              placeholder="Describe what specific information, data, or insights you need..."
              value={tempColleague.infoNeeded}
              onChange={(e) =>
                setTempColleague({
                  ...tempColleague,
                  infoNeeded: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none h-28"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={handleAddColleague}
            disabled={!tempColleague.name.trim()}
            className="bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            Add Colleague
          </Button>
        </div>
      </div>
    </div>
  );
}
