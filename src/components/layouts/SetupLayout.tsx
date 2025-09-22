"use client";

import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SetupLayoutProps {
  // Sidebar
  sidebarBackText: string; // usually "Back to dashboard"
  onSidebarBack: () => void;
  sidebarTitle: string;
  sidebarIcon?: ReactNode; // optional, fully controlled by caller

  // Main content
  title: string; // always required
  subtitle?: string;
  children: ReactNode;

  // Footer
  onFlowBack: () => void; // back to previous step/flow
  primaryButtonText: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function SetupLayout({
  sidebarBackText,
  onSidebarBack,
  sidebarTitle,
  sidebarIcon,
  title,
  subtitle,
  children,
  onFlowBack,
  primaryButtonText,
  onSubmit,
}: SetupLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-96 bg-gray-100 border-r border-gray-200 px-12 pt-10 pb-6 flex flex-col">
        <header>
          {/* Always back to dashboard (or equivalent) */}
          <Button
            onClick={onSidebarBack}
            variant="backLink"
            size="backLink"
            leadingIcon={<ChevronLeft className="size-5" />}
          >
            {sidebarBackText}
          </Button>

          {/* Sidebar title + optional icon */}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-10 pt-10 pb-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Header */}
          <header className="mt-6">
            <h1 className="text-2xl font-medium text-gray-900 mb-2 mt-8">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </header>

          {/* Custom fields */}
          <div className="space-y-4">{children}</div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Footer: always Back (flow) + Primary */}
          <div className="flex justify-between items-center">
            <Button type="button" variant="outline" onClick={onFlowBack}>
              Back
            </Button>
            <Button type="submit">{primaryButtonText}</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
