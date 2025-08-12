import { Info } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No Integrations Installed",
  description = "You don't have any integration installed.",
  buttonLabel = "Browse integrations",
  onButtonClick,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`border border-gray-200/60 rounded-lg bg-gray-50/30 py-32 px-20 flex flex-col items-center justify-center text-center min-h-[600px] ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200/60 flex items-center justify-center mb-6">
        <Info className="w-5 h-5 text-gray-500" />
      </div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">{description}</p>
      <Button
        variant="outline"
        className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-white font-normal px-4 py-2 text-sm"
        onClick={onButtonClick}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
