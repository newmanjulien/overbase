"use client";

import { Button } from "../../../components/ui/button";
import { HandlerSelect } from "../../../components/HandlerSelect";
import { useRouter } from "next/navigation"; // 1️⃣

interface TemplateCardProps {
  title: string;
  description: string;
  handlerId: string;
  onHandlerChange: (id: string) => void;
  gradientFrom?: string;
  gradientTo?: string;
}

export function TemplateCard({
  title,
  description,
  handlerId,
  onHandlerChange,
  gradientFrom = "from-emerald-400",
  gradientTo = "to-teal-500",
}: TemplateCardProps) {
  const router = useRouter(); // 2️⃣

  return (
    <div
      className="rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push("/dashboard/agent")} // 3️⃣
    >
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
          onClick={(e) => {
            e.stopPropagation(); // 4️⃣ prevent card navigation
            navigator.clipboard
              .writeText(title)
              .then(() => alert(`Copied template: ${title}`))
              .catch(() => alert("Failed to copy template."));
          }}
          aria-label={`Copy template ${title}`}
        >
          Launch
        </Button>
      </div>

      <div className="bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{description}</p>
        <HandlerSelect value={handlerId} onChange={onHandlerChange} />
      </div>
    </div>
  );
}
