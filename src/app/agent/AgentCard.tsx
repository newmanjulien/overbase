"use client";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Webhook,
  User,
  GitBranch,
} from "lucide-react";

const CARD_TYPES = {
  webhook: {
    name: "Webhooks by Zapier",
    icon: Webhook,
    color: "border-orange-200 bg-orange-50 text-orange-700",
    iconBg: "bg-orange-100",
  },
  clearbit: {
    name: "Clearbit",
    icon: User,
    color: "border-blue-200 bg-blue-50 text-blue-700",
    iconBg: "bg-blue-100",
  },
  paths: {
    name: "Paths",
    icon: GitBranch,
    color: "border-amber-200 bg-amber-50 text-amber-700",
    iconBg: "bg-amber-100",
  },
} as const;

interface AgentCardProps {
  data: any;
}

export default function AgentCard({ data }: AgentCardProps) {
  const cardType =
    CARD_TYPES[data.type as keyof typeof CARD_TYPES] || CARD_TYPES.webhook;
  const IconComponent = cardType.icon;

  return (
    <div className="relative">
      <Card
        className="w-80 p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        // onClick={() => data.onEdit?.(data.id)}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-xs font-medium ${cardType.color}`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${cardType.iconBg}`}
                >
                  <IconComponent className="w-2.5 h-2.5" />
                </div>
                <span>{cardType.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete?.(data.id);
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                ×
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-900">
              {data.stepNumber}. {data.title || "Untitled Step"}
            </h3>
            {data.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {data.description}
              </p>
            )}
          </div>

          {data.type === "paths" && (
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-xs text-gray-500">Configure paths</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          )}
        </div>
      </Card>

      {/* Add-button below card */}
      <div className="flex justify-center mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            data.onAddBelow?.(data.id);
          }}
          className="w-7 h-7 p-0 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 bg-white shadow-sm"
        >
          <Plus className="w-3 h-3 text-gray-400 hover:text-blue-500" />
        </Button>
      </div>
    </div>
  );
}

export { CARD_TYPES };
