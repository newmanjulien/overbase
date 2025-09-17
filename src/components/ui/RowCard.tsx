"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { Button } from "./button";

interface RowCardProps {
  id?: number;
  title?: string;
  titleClassName?: string;
  subtitle?: ReactNode;
  image?: string;
  leading?: ReactNode;
  contentBox?: ReactNode; // grey box content
  actions?: ReactNode; // right-aligned with menu
  menu?: ReactNode; // always pinned flush right
  onEdit?: () => void;
  buttonLabel?: string;
  buttonOnClick?: () => void;
  buttonClassName?: string;
  showGreenDot?: boolean;
}

export function RowCard({
  title,
  titleClassName,
  subtitle,
  image,
  leading,
  contentBox,
  actions,
  menu,
  onEdit,
  buttonLabel,
  buttonOnClick,
  buttonClassName = "text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60 whitespace-nowrap flex-shrink-0",
  showGreenDot = false,
}: RowCardProps) {
  return (
    <div className="flex items-center py-3 px-3 bg-white border border-gray-200/60 hover:border-gray-300 transition-all duration-200 rounded-lg">
      {/* Leading (checkbox, avatar, etc.) */}
      {leading || image ? (
        image ? (
          <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200/60 flex items-center justify-center relative mr-4">
            <Image
              src={image}
              alt={typeof title === "string" ? title : "row card image"}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center mr-4">{leading}</div>
        )
      ) : null}

      {/* Content area (shrinks first, always leaves space before buttons) */}
      <div className="min-w-0 max-w-xl flex-shrink mr-4">
        {contentBox ? (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 leading-tight overflow-hidden line-clamp-2">
            {contentBox}
          </div>
        ) : (
          <>
            {title && (
              <h3
                className={`text-sm tracking-tight leading-tight truncate ${
                  titleClassName ?? "text-gray-700 font-medium"
                }`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-gray-500 text-sm font-light leading-relaxed truncate">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>

      {/* Right: actions + green dot + menu */}
      <div className="flex items-center gap-x-3 ml-auto flex-shrink-0">
        {/* Actions group */}
        <div className="flex items-center gap-x-3 flex-shrink-0">
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
              className="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60 whitespace-nowrap flex-shrink-0"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}

          {actions}
        </div>

        {/* Green dot */}
        {showGreenDot && <div className="w-2 h-2 bg-green-500 rounded-full" />}

        {/* Menu with a bit of spacing */}
        {menu && <div className="pl-2">{menu}</div>}
      </div>
    </div>
  );
}
