"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "./button";

interface HeaderProps {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  variant?: "white" | "black";
  learnMoreLink?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
  variant,
  learnMoreLink = "#",
}) => {
  const isBlack = variant === "black";
  const showButton = buttonLabel && onButtonClick;

  return (
    <div className="border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto p-6 py-8">
        <div className="flex items-center justify-between mb-4">
          {/* Left: stacked h1 and subtitle with link */}
          <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
            <h1 className="text-[2rem] font-medium tracking-tight mb-4 text-gray-800">
              {title}
            </h1>
            <h2 className="text-sm font-normal mt-1 text-gray-500">
              {subtitle}{" "}
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
          </div>

          {/* Right: button */}
          {showButton && (
            <Button
              onClick={onButtonClick}
              className={`font-normal border ${
                isBlack
                  ? "bg-black text-white hover:bg-black/90 border-transparent"
                  : "bg-white text-black border-gray-200 hover:bg-gray-100"
              }`}
            >
              {buttonLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
