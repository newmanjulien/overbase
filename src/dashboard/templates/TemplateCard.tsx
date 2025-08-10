import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

interface TemplateCardProps {
  title: string;
  description: string;
  createdBy: string;
  creatorPhoto: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function TemplateCard({
  title,
  description,
  createdBy,
  creatorPhoto,
  gradientFrom = "from-emerald-400",
  gradientTo = "to-teal-500",
}: TemplateCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div
        className={`relative h-56 flex items-center justify-center bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      >
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-medium text-gray-800">
          {title.charAt(0)}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 bg-white text-gray-800 hover:bg-gray-50 font-normal"
          onClick={() => {
            navigator.clipboard
              .writeText(title)
              .then(() => {
                alert(`Copied template: ${title}`);
              })
              .catch(() => {
                alert("Failed to copy template.");
              });
          }}
          aria-label={`Copy template ${title}`}
        >
          Copy
        </Button>
      </div>

      <div className="bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{description}</p>

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
