"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { Button } from "../../../../components/ui/button";

const CustomEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const onAddBetween = data?.onAddBetween as
      | ((edgeId: string) => void)
      | undefined;

    return (
      <>
        <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />

        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-8 w-8 flex items-center justify-center bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-gray-600 hover:text-gray-800 font-normal text-sm"
              onClick={() => {
                if (onAddBetween) {
                  onAddBetween(id);
                }
              }}
            >
              +
            </Button>
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }
);

CustomEdge.displayName = "CustomEdge";
export default CustomEdge;
