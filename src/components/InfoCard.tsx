import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";

interface InfoCardProps {
  text: string;
  href?: string;
  linkText?: string;
  onClick?: () => void;
}

export function InfoCard({
  text,
  href,
  linkText = "Learn more",
  onClick,
}: InfoCardProps) {
  return (
    <Alert className="flex items-center justify-between rounded-xl bg-gray-200/80 border border-none text-sm">
      {/* Left side: icon + text */}
      <div className="flex items-center space-x-2">
        <Info className="size-4" />
        <AlertDescription className="text-gray-800">{text}</AlertDescription>
      </div>

      {/* Right side: button OR link */}
      {onClick ? (
        <button onClick={onClick} className="inline-flex items-center">
          <span>{linkText}</span>
          <ExternalLink className="ml-1 h-4 w-4" />
        </button>
      ) : (
        <a href={href} className="inline-flex items-center">
          <span>{linkText}</span>
          <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      )}
    </Alert>
  );
}
