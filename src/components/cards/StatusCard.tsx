"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ASSET_KEYS } from "@/lib/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ============================================
// PROP TYPES
// ============================================

interface StatusCardProps {
  label: string;
  subLabel?: string;
}

// ============================================
// COMPONENT
// ============================================

/**
 * StatusCard - A lightweight card for status indicators
 * (e.g., "Overbase is answering...", "Next answer on...")
 *
 * Unlike AnswerCard, this component:
 * - Only fetches the Overbase icon (no user avatar)
 * - Has no mutations or interactive controls
 * - Uses a simple, focused prop interface
 */
export default function StatusCard({ label, subLabel }: StatusCardProps) {
  const overbaseIconAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.OVERBASE_ICON,
  });
  const overbaseIcon = overbaseIconAsset?.imageUrl ?? null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="p-4">
        {/* Header: avatar + labels */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={overbaseIcon ?? undefined} />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm text-gray-700">{label}</span>
            {subLabel && (
              <span className="text-xs text-gray-400">{subLabel}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
