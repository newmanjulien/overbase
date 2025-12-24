"use client";

import { Button } from "@/components/ui/button";
import { GRADIENTS, DEFAULT_GRADIENT, type GradientKey } from "./gradients";

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  gradient?: GradientKey;
  imageUrl?: string | null;
  onUse?: () => void;
}

export function TemplateCard({
  title,
  description,
  gradient = DEFAULT_GRADIENT,
  imageUrl,
  onUse,
}: TemplateCardProps) {
  const gradientClasses = GRADIENTS[gradient] ?? GRADIENTS[DEFAULT_GRADIENT];

  return (
    <div className="rounded-3xl border border-gray-200/60 overflow-hidden cursor-pointer hover:shadow-md transform transition-all duration-200">
      {/* Top gradient + image/logo */}
      <div
        className={`relative h-56 flex items-center justify-center bg-gradient-to-r ${gradientClasses}`}
      >
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center w-15 h-15 rounded-full bg-white p-1">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                width={54}
                height={54}
                className="rounded-full object-cover w-[54px] h-[54px]"
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
          className="absolute top-3 right-3"
          onClick={onUse}
        >
          Use
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
