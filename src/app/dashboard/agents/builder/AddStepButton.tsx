"use client";

import { Button } from "../../../../components/ui/button";
import { Plus } from "lucide-react";

interface AddStepButtonProps {
  onAddBelow: () => void;
}

export function AddStepButton({ onAddBelow }: AddStepButtonProps) {
  return (
    <div className="nodrag nopan" style={{ position: "relative", height: 60 }}>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="calc(50% + 18px)"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "all",
        }}
      >
        <Button
          size="sm"
          variant="outline"
          className="rounded-full h-8 w-8 flex items-center justify-center bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-gray-600 hover:text-gray-800 font-normal text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddBelow();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
