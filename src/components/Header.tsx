"use client";

import { ExternalLink, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

interface HeaderProps {
  title: string;
  subtitle?: string;
  learnMoreLink?: string;

  // Main CTA button (right column)
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonVariant?: "default" | "outline";

  // Backlink (left-side navigation button with chevron)
  backlink?: boolean;
  onBacklinkClick?: () => void;
  backlinkLabel?: string; // <-- NEW

  // Optional logo next to the title
  logo?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  learnMoreLink,
  buttonLabel,
  onButtonClick,
  buttonVariant = "default",
  backlink,
  onBacklinkClick,
  backlinkLabel, // <-- NEW
  logo,
}) => {
  return (
    <header className="border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-6 pb-12 pt-8 grid grid-cols-[1fr_auto] items-center gap-6">
        {/* Left side */}
        <div className="flex flex-col gap-3">
          {backlink && (
            <Button
              onClick={onBacklinkClick}
              variant="backLink"
              size="backLink"
            >
              <ChevronLeft className="size-5" />
              {backlinkLabel ?? "Back"}
            </Button>
          )}

          {/* Title + Subtitle block */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-4">
              {logo && (
                <div className="size-12 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                  <Image
                    src={logo}
                    alt={title}
                    width={35}
                    height={35}
                    className="object-contain"
                  />
                </div>
              )}
              <h1 className="text-3xl font-medium tracking-tight text-gray-800">
                {title}
              </h1>
            </div>

            {subtitle && (
              <h2 className="text-sm font-normal mt-1 text-gray-500">
                {subtitle}
                {learnMoreLink && (
                  <a
                    href={learnMoreLink}
                    className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-600/80 transition-colors"
                  >
                    <span>Learn more</span>
                    <ExternalLink className="ml-1 size-4" />
                  </a>
                )}
              </h2>
            )}
          </div>
        </div>

        {/* Right side */}
        {buttonLabel && onButtonClick && (
          <div className="flex items-center">
            <Button onClick={onButtonClick} variant={buttonVariant}>
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
