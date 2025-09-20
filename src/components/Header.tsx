"use client";

import { ExternalLink, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

interface HeaderProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  variant?: "white" | "black" | "overview";
  learnMoreLink?: string;

  // New props for "overview" style
  showBackButton?: boolean;
  onBackClick?: () => void;
  logo?: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  switch (props.variant) {
    case "overview":
      return renderOverviewHeader(props);
    case "black":
    case "white":
    default:
      return renderDefaultHeader(props);
  }
};

/* -------------------------------
   Render Helpers
--------------------------------*/

function renderDefaultHeader({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
  variant,
  learnMoreLink = "#",
}: HeaderProps) {
  const isBlack = variant === "black";
  const showButton = buttonLabel && onButtonClick;

  return (
    <div className="border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto p-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          {/* Left: title + subtitle */}
          <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
            <h1 className="text-[2rem] font-medium tracking-tight mb-4 text-gray-800">
              {title}
            </h1>
            {subtitle && (
              <h2 className="text-sm font-normal mt-1 text-gray-500">
                {subtitle}
                {learnMoreLink && (
                  <a
                    href={learnMoreLink}
                    className="inline-flex items-center ml-1 text-[#1A69FF] hover:text-[#1A69FF]/80 transition-colors"
                  >
                    <span>Learn more</span>
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                )}
              </h2>
            )}
          </div>

          {/* Right: optional button */}
          {showButton && (
            <Button
              onClick={onButtonClick}
              className={`font-normal border ${
                isBlack
                  ? "bg-black text-white hover:bg-black/90 border-transparent rounded-lg"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100 rounded-lg"
              }`}
            >
              {buttonLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function renderOverviewHeader({
  title,
  showBackButton,
  onBackClick,
  logo,
  actionButtonLabel,
  onActionButtonClick,
}: HeaderProps) {
  return (
    <header className="bg-[#FAFAFA] border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
        <div className="flex flex-col gap-2 max-w-[calc(100%-180px)]">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-600 text-sm font-base"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to connectors
            </button>
          )}
          <div className="flex items-center gap-4 mt-1">
            {logo && (
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                <Image
                  src={logo}
                  alt={title}
                  width={35}
                  height={35}
                  className="object-contain"
                />
              </div>
            )}
            <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {actionButtonLabel && (
          <Button
            onClick={onActionButtonClick}
            className="font-normal rounded-lg bg-black text-white hover:bg-black/90 border border-transparent"
          >
            {actionButtonLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
