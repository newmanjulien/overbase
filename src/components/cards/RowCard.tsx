"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface MenuItem {
  id?: string;
  label: string;
  onClick?: () => void;
  destructive?: boolean;
}

export interface RowCardProps {
  // Content
  title?: string;
  titleClassName?: string;
  subtitle?: ReactNode;

  // Leading / Avatar
  leading?: ReactNode;
  image?: string;
  showAvatar?: boolean;

  // Actions
  buttonLabel?: string;
  buttonOnClick?: () => void;
  showGreenDot?: boolean;
  menuItems?: MenuItem[];
}

const buttonClasses =
  "text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60 whitespace-nowrap flex-shrink-0";

export function RowCard({
  title,
  titleClassName,
  subtitle,
  leading,
  image,
  showAvatar = false,
  buttonLabel,
  buttonOnClick,
  showGreenDot = false,
  menuItems,
}: RowCardProps) {
  return (
    <div className="flex items-center py-3 px-3 bg-white border border-gray-200/60 hover:border-gray-300 transition-all duration-200 rounded-xl">
      <Leading
        image={image}
        leading={leading}
        title={title}
        showAvatar={showAvatar}
      />
      <Content
        title={title}
        titleClassName={titleClassName}
        subtitle={subtitle}
      />
      <Actions
        buttonLabel={buttonLabel}
        buttonOnClick={buttonOnClick}
        showGreenDot={showGreenDot}
        menuItems={menuItems}
      />
    </div>
  );
}

// --- Subcomponents ---

function Leading({
  image,
  leading,
  title,
  showAvatar,
}: Pick<RowCardProps, "image" | "leading" | "title" | "showAvatar">) {
  if (!leading && !showAvatar) return null;

  return (
    <div className="flex items-center mr-2">
      {leading && <div className={showAvatar ? "mr-3" : ""}>{leading}</div>}

      {showAvatar && (
        <Avatar className="size-11 border border-gray-200/60 bg-gray-100">
          {image ? (
            <AvatarImage src={image} alt="" />
          ) : (
            <AvatarFallback>
              {title ? title.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </div>
  );
}

function Content({
  title,
  titleClassName,
  subtitle,
}: Pick<RowCardProps, "title" | "titleClassName" | "subtitle">) {
  return (
    <div className="flex-1 min-w-0 mr-4">
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
  );
}

function Actions({
  buttonLabel,
  buttonOnClick,
  showGreenDot,
  menuItems,
}: Pick<
  RowCardProps,
  "buttonLabel" | "buttonOnClick" | "showGreenDot" | "menuItems"
>) {
  return (
    <div className="flex items-center gap-x-3 ml-auto shrink-0">
      {buttonLabel && (
        <Button
          variant="ghost"
          className={buttonClasses}
          onClick={buttonOnClick}
        >
          {buttonLabel}
        </Button>
      )}

      {showGreenDot && <div className="w-2 h-2 bg-green-500 rounded-full" />}

      {menuItems && menuItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {menuItems.map((item) => (
              <DropdownMenuItem
                key={item.id ?? item.label}
                onClick={item.onClick}
                className={
                  item.destructive
                    ? "text-red-600 focus:text-red-600 focus:bg-red-100"
                    : ""
                }
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
