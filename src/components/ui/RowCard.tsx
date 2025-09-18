"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { Button } from "./button";

interface RowCardProps {
  title?: string;
  titleClassName?: string;
  subtitle?: ReactNode;
  image?: string; // if provided (even empty string), avatar area is shown
  leading?: ReactNode; // sits even farther left (e.g., a checkbox)
  contentBox?: ReactNode;
  actions?: ReactNode;
  menu?: ReactNode;
  onEdit?: () => void;
  buttonLabel?: string;
  buttonOnClick?: () => void;
  buttonClassName?: string;
  showGreenDot?: boolean;
}

export function RowCard(props: RowCardProps) {
  const {
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
    buttonClassName = defaultButtonClasses,
    showGreenDot = false,
  } = props;

  return (
    <div className="flex items-center py-3 px-3 bg-white border border-gray-200/60 hover:border-gray-300 transition-all duration-200 rounded-xl">
      <Leading image={image} leading={leading} title={title} />
      <Content
        title={title}
        titleClassName={titleClassName}
        subtitle={subtitle}
        contentBox={contentBox}
      />
      <Actions
        buttonLabel={buttonLabel}
        buttonOnClick={buttonOnClick}
        buttonClassName={buttonClassName}
        onEdit={onEdit}
        actions={actions}
        showGreenDot={showGreenDot}
        menu={menu}
      />
    </div>
  );
}

// --- Subcomponents ---

const defaultButtonClasses =
  "text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60 whitespace-nowrap flex-shrink-0";

function Leading({
  image,
  leading,
  title,
}: Pick<RowCardProps, "image" | "leading" | "title">) {
  if (!image && !leading) return null;

  return (
    <div className="flex items-center mr-2">
      {leading && (
        <div
          className={
            image !== undefined
              ? "mr-3 flex items-center justify-center"
              : "flex items-center justify-center"
          }
        >
          {leading}
        </div>
      )}

      {image !== undefined && (
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200/60 flex items-center justify-center bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={typeof title === "string" ? title : "Row card image"}
              width={33}
              height={33}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {typeof title === "string" ? title.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Content({
  title,
  titleClassName,
  subtitle,
  contentBox,
}: Pick<RowCardProps, "title" | "titleClassName" | "subtitle" | "contentBox">) {
  return (
    <div className="min-w-0 max-w-xl flex-shrink mr-4">
      {contentBox ? (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 leading-tight">
          <p className="line-clamp-2">{contentBox}</p>
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
  );
}

function Actions({
  buttonLabel,
  buttonOnClick,
  buttonClassName,
  onEdit,
  actions,
  showGreenDot,
  menu,
}: Omit<
  RowCardProps,
  "title" | "subtitle" | "image" | "leading" | "contentBox" | "titleClassName"
>) {
  return (
    <div className="flex items-center gap-x-3 ml-auto flex-shrink-0">
      <div className="flex items-center gap-x-3 flex-shrink-0">
        {buttonLabel && (
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
            className={defaultButtonClasses}
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
        {actions}
      </div>

      {showGreenDot && <div className="w-2 h-2 bg-green-500 rounded-full" />}
      {menu && <div className="pl-2">{menu}</div>}
    </div>
  );
}
