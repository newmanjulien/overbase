import { Button } from "./ui/button";
import { Calendar, Database, Plug } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  className?: string;
  buttonVariant?: "default" | "secondary";
  iconType: "calendar" | "database" | "plug";
  withBorder?: boolean; // optional, defaults to false
}

const iconMap = {
  calendar: Calendar,
  database: Database,
  plug: Plug,
};

export function EmptyState({
  title,
  description,
  buttonLabel,
  onButtonClick,
  className = "",
  buttonVariant = "secondary",
  iconType,
  withBorder = false,
}: EmptyStateProps) {
  const Icon = iconMap[iconType];

  return (
    <div
      className={`${
        withBorder ? "border border-gray-200/60 rounded-2xl" : ""
      } py-12 px-10 flex flex-col items-center justify-center text-center min-h-[250px] ${className}`}
    >
      {/* Icon bubble */}
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>

      <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">{description}</p>

      {buttonLabel && onButtonClick && (
        <Button onClick={onButtonClick} variant={buttonVariant}>
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
