import { Button } from "./button";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  className?: string;
  buttonVariant?: "primary" | "secondary";
  icon: ReactNode; // ✅ mandatory
  withBorder?: boolean;
}

export function EmptyState({
  title,
  description,
  buttonLabel,
  onButtonClick,
  className = "",
  buttonVariant = "secondary",
  icon,
  withBorder = true,
}: EmptyStateProps) {
  return (
    <div
      className={`${
        withBorder ? "border border-gray-200/60 rounded-2xl" : ""
      } py-12 px-10 flex flex-col items-center justify-center text-center min-h-[250px] ${className}`}
    >
      {/* Icon bubble */}
      <div className="w-16 h-16 bg-gray-200/60 rounded-full flex items-center justify-center mb-6">
        <div className="w-6 h-6 text-gray-600 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">{description}</p>

      {/* Button only if props provided */}
      {buttonLabel && onButtonClick && (
        <Button
          onClick={onButtonClick}
          className={
            buttonVariant === "primary"
              ? "bg-gray-900 text-white hover:bg-gray-800 font-medium px-6 py-3 text-sm rounded-lg"
              : "text-gray-900 border border-gray-200 hover:bg-gray-50 bg-white font-normal px-4 py-2 text-sm rounded-lg"
          }
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
