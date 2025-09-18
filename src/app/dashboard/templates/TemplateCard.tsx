"use client";

import { Button } from "../../../components/ui/button";
import Image from "next/image";

interface TemplateCardProps {
  id: number;
  title: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
  image?: string;
  onLaunch?: () => void;
}

export function TemplateCard({
  title,
  description,
  gradientFrom = "from-emerald-400",
  gradientTo = "to-teal-500",
  image,
  onLaunch,
}: TemplateCardProps) {
  return (
    <div className="rounded-3xl border border-gray-200/60 overflow-hidden cursor-pointer hover:shadow-md transform transition-all duration-200">
      {/* Top gradient + image/logo */}
      <div
        className={`relative h-56 flex items-center justify-center bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      >
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center w-15 h-15 rounded-full bg-white p-1">
            {image ? (
              <Image
                src={image}
                alt={`${title} logo`}
                width={54}
                height={54}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-800">
                {title.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 bg-white rounded-lg text-gray-800 hover:bg-gray-50 font-normal"
          onClick={onLaunch}
        >
          Launch
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white p-4 pt-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
