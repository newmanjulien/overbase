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
  }: EdgeProps) => {
    // getBezierPath will give us a nice curved line and the label position
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return (
      <>
        <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />

        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all", // allow clicks
            }}
          >
            <Button
              size="sm"
              variant="outline"
              className="rounded-full px-2 h-6 w-6 flex items-center justify-center"
              onClick={() => {
                console.log("Plus button clicked on edge", id);
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
