import { X } from "lucide-react";
import { ReactNode } from "react";

interface AttachmentChipProps {
  icon: ReactNode;
  label: string;
  onRemove?: () => void; // Optional - when omitted, chip is read-only (no X button)
}

export function AttachmentChip({ icon, label, onRemove }: AttachmentChipProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-800">
      {icon}
      <span className="max-w-[200px] truncate">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-gray-800 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
