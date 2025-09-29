"use client";

import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SetupLayoutProps {
  // Sidebar
  sidebarBackText: string; // usually "Back to dashboard"
  onSidebarBack: () => void | Promise<void>;
  sidebarTitle: string;
  sidebarIcon?: ReactNode; // optional, fully controlled by caller

  // Optional sidebar actions (bottom)
  sidebarActionText?: string;
  onSidebarAction?: () => void | Promise<void>;

  // Main content
  title: string; // always required
  subtitle?: string;
  children: ReactNode;

  // Footer (always 2 buttons, symmetric)
  primaryButtonText: string;
  onPrimaryAction: () => void | Promise<void>;
  secondaryButtonText: string;
  onSecondaryAction: () => void | Promise<void>;

  // Optional top-right toggle
  toggleValue?: string;
  onToggleChange?: (val: string) => void;
  toggleOptions?: Array<{ value: string; label: string }>;
}

export default function SetupLayout({
  sidebarBackText,
  onSidebarBack,
  sidebarTitle,
  sidebarIcon,
  sidebarActionText,
  onSidebarAction,
  title,
  subtitle,
  children,
  primaryButtonText,
  onPrimaryAction,
  secondaryButtonText,
  onSecondaryAction,
  toggleValue,
  onToggleChange,
  toggleOptions,
}: SetupLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Toggle */}
      {toggleOptions && onToggleChange && (
        <div className="absolute top-25 right-14">
          <ToggleGroup
            type="single"
            value={toggleValue}
            onValueChange={(val) => val && onToggleChange(val)}
            variant="outline"
            size="sm"
          >
            {toggleOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sticky top-14 h-[calc(100vh-56px)] flex flex-col w-96 bg-gray-100 border-r border-gray-200 px-12 pt-10 pb-6">
        <header>
          <Button
            onClick={onSidebarBack}
            variant="backLink"
            size="backLink"
            leadingIcon={<ChevronLeft className="size-5" />}
          >
            {sidebarBackText}
          </Button>

          <div
            className={`mt-2 ${sidebarIcon ? "flex items-center gap-3" : ""}`}
          >
            {sidebarIcon && (
              <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center">
                {sidebarIcon}
              </div>
            )}
            <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
              {sidebarTitle}
            </h2>
          </div>
        </header>

        {/* Bottom sidebar action */}
        {sidebarActionText && onSidebarAction && (
          <div className="mt-auto">
            <Button
              variant="backLink"
              size="backLink"
              onClick={onSidebarAction}
            >
              {sidebarActionText}
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-10 pt-4 pb-6">
        <div className="space-y-6">
          {/* Header */}
          <header className="mt-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-medium text-gray-900 mb-2 mt-8">
                {title}
              </h1>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </header>

          {/* Custom fields */}
          <div className="space-y-4">{children}</div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Footer: Secondary + Primary */}
          <div className="flex justify-between items-center">
            <Button type="button" variant="outline" onClick={onSecondaryAction}>
              {secondaryButtonText}
            </Button>
            <Button type="button" onClick={onPrimaryAction}>
              {primaryButtonText}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
