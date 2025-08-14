// /src/app/agent/CustomEdge.tsx

"use client";

import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: {
    onAddBetween?: (edgeId: string) => void;
  };
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: CustomEdgeProps) {
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
        stroke="#d1d5db"
        strokeWidth={2}
        fill="none"
      />
      <foreignObject x={midX - 10} y={midY - 10} width={20} height={20}>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            data?.onAddBetween?.(id);
          }}
          className="w-5 h-5 p-0 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 bg-white shadow-sm"
        >
          <Plus className="w-2.5 h-2.5 text-gray-400 hover:text-blue-500" />
        </Button>
      </foreignObject>
    </>
  );
}
