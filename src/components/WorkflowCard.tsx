import Image from "next/image";
import { ReactNode } from "react";
import { Button } from "./ui/button";

interface WorkflowCardProps {
  id: number;
  title: string;
  subtitle: string;
  image?: string;
  actions?: ReactNode;
  onEdit?: () => void;
}

export function WorkflowCard({
  title,
  subtitle,
  image,
  actions,
  onEdit,
}: WorkflowCardProps) {
  return (
    <div className="flex items-center justify-between py-3 px-3 bg-white border border-gray-200/60 hover:border-gray-300 transition-all duration-200 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden border border-gray-200/60">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="min-w-0 max-w-xl">
          <h3 className="font-semibold text-gray-700 text-sm tracking-tight leading-tight">
            {title}
          </h3>
          <p className="text-gray-500 text-sm font-light leading-relaxed truncate">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {/* Launch button — always visible, green hover */}
        <Button
          variant="ghost"
          className="text-gray-700 hover:bg-green-50 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
          onClick={() => {}}
        >
          Launch
        </Button>

        {/* Schedule button — always visible, gray hover like Edit */}
        <Button
          variant="ghost"
          className="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
          onClick={() => {}}
        >
          Schedule
        </Button>

        {/* Edit button — only if onEdit prop passed */}
        {onEdit && (
          <Button
            variant="ghost"
            className="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}

        {actions && (
          <div className="flex items-center space-x-3">{actions}</div>
        )}
      </div>
    </div>
  );
}
