"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function ModalShell({
  isOpen,
  onClose,
  children,
  footer,
}: ModalShellProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-2 border-t border-gray-200 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
