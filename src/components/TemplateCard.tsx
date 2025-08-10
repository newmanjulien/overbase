import Image from "next/image";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface TemplateCardProps {
  title: string;
  description: string;
  createdBy: string;
  creatorPhoto: string;
}

export function TemplateCard({
  title,
  description,
  createdBy,
  creatorPhoto,
}: TemplateCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Top section */}
      <div className="relative bg-gradient-to-r from-emerald-400 to-teal-500 h-40 flex items-center justify-center">
        {/* Center initial: first letter of title */}
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-medium text-gray-800">
          {title.charAt(0)}
        </div>
        {/* Copy button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
          onClick={() => {
            navigator.clipboard.writeText(title);
            alert(`Copied template: ${title}`);
          }}
          aria-label={`Copy template ${title}`}
        >
          Copy
        </Button>
      </div>

      {/* Bottom section */}
      <div className="bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{description}</p>

        {/* Author */}
        <div className="flex items-center space-x-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={creatorPhoto} alt={createdBy} />
            <AvatarFallback>
              {createdBy
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-500">Created by {createdBy}</span>
        </div>
      </div>
    </div>
  );
}
