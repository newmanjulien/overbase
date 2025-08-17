"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  variant?: "white" | "black"; // switch styles
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
  variant = "white",
}) => {
  const isBlack = variant === "black";

  return (
    <div
      className={`border-b ${
        isBlack ? "border-transparent" : "border-gray-200/60"
      }`}
      style={{ backgroundColor: isBlack ? "black" : "#FAFAFA" }}
    >
      <div className="max-w-7xl mx-auto p-6 py-8">
        <div className="flex items-center justify-between mb-4">
          {/* Left: stacked h1 and subtitle with link */}
          <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
            <h1
              className={`text-[2rem] font-medium tracking-tight mb-4 ${
                isBlack ? "text-white" : "text-gray-800"
              }`}
            >
              {title}
            </h1>
            <h2
              className={`text-sm font-normal mt-1 ${
                isBlack ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {subtitle}{" "}
              <a
                href="#"
                className={`inline-flex items-center ml-1 transition-colors ${
                  isBlack
                    ? "text-[#1A69FF] hover:text-[#1A69FF]/80"
                    : "text-[#1A69FF] hover:text-[#1A69FF]/80"
                }`}
              >
                <span>Learn more</span>
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </h2>
          </div>

          {/* Right: button */}
          {buttonLabel && onButtonClick && (
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
