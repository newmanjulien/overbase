"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { Button } from "./button";

interface RowCardProps {
  id?: number;
  title: string;
  titleClassName?: string; // optional prop to customize title styling
  subtitle?: ReactNode;
  image?: string;
  actions?: ReactNode;
  onEdit?: () => void;
  buttonLabel?: string;
  buttonOnClick?: () => void;
  buttonClassName?: string;
  showGreenDot?: boolean;
  leading?: ReactNode; // content on the left (e.g., checkbox)
}

export function RowCard({
  title,
  titleClassName,
  subtitle,
  image,
  actions,
  onEdit,
  buttonLabel = "Launch",
  buttonOnClick,
  buttonClassName = "text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60",
  showGreenDot = false,
  leading,
}: RowCardProps) {
  return (
    <div className="flex items-center justify-between py-3 px-3 bg-white border border-gray-200/60 hover:border-gray-300 transition-all duration-200 rounded-lg">
      <div className="flex items-center space-x-4 min-w-0">
        {leading || image ? (
          image ? (
            <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200/60 flex items-center justify-center relative">
              <Image
                src={image}
                alt={typeof title === "string" ? title : "row card image"}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center">{leading}</div>
          )
        ) : null}

        {/* Title and subtitle */}
        <div className="min-w-0 max-w-xl">
          <h3
            className={`text-sm tracking-tight leading-tight truncate ${
              titleClassName ?? "text-gray-700 font-medium"
            }`}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-gray-500 text-sm font-light leading-relaxed truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Actions and buttons on right */}
      <div className="flex items-center space-x-3">
        {buttonLabel && buttonLabel.trim() !== "" && (
          <Button
            variant="ghost"
            className={buttonClassName}
            onClick={buttonOnClick}
          >
            {buttonLabel}
          </Button>
        )}

        {onEdit && (
          <Button
            variant="ghost"
            className="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}

        {actions && (
          <div className="flex items-center space-x-3">{actions}</div>
        )}

        {showGreenDot && <div className="w-2 h-2 bg-green-500 rounded-full" />}
      </div>
    </div>
  );
}
