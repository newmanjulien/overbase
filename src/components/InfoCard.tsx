import { Info, ExternalLink } from "lucide-react";

interface InfoCardProps {
  text: string;
  href?: string;
  linkText?: string;
  onClick?: () => void; // <-- Support onClick
}

export function InfoCard({
  text,
  href,
  linkText = "Learn more",
  onClick,
}: InfoCardProps) {
  return (
    <div className="bg-gray-200 rounded-lg p-3 flex items-center justify-between text-gray-700 text-sm">
      <div className="flex items-center space-x-2">
        <Info className="h-4 w-4" />
        <span>{text}</span>
      </div>

      {onClick ? (
        <button
          onClick={onClick}
          className="inline-flex items-center hover:text-gray-900 transition-colors"
        >
          <span>{linkText}</span>
          <ExternalLink className="ml-1 h-4 w-4" />
        </button>
      ) : (
        <a
          href={href}
          className="inline-flex items-center hover:text-gray-900 transition-colors"
        >
          <span>{linkText}</span>
          <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      )}
    </div>
  );
}
