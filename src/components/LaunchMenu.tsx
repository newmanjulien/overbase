// interface LaunchMenuProps {
//   isOpen: boolean;
//   onSelect: (type: "one-time" | "schedule") => void;
// }

// export function LaunchMenu({ isOpen, onSelect }: LaunchMenuProps) {
//   if (!isOpen) return null;

//   return (
//     <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
//       <div className="py-1">
//         <button
//           onClick={() => onSelect("one-time")}
//           className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
//         >
//           One time
//         </button>
//         <button
//           onClick={() => onSelect("schedule")}
//           className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
//         >
//           Schedule
//         </button>
//       </div>
//     </div>
//   );
// }
import { useEffect, useRef } from "react";

interface LaunchMenuProps {
  isOpen: boolean;
  onSelect: (type: "one-time" | "schedule") => void;
  onClose: () => void;
}

export function LaunchMenu({ isOpen, onSelect, onClose }: LaunchMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50"
    >
      <div className="py-1">
        <button
          onClick={() => onSelect("one-time")}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          One time
        </button>
        <button
          onClick={() => onSelect("schedule")}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          Schedule
        </button>
      </div>
    </div>
  );
}
