"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

/**
 * Asset keys used throughout the app.
 * Keep these in sync with the seeded data in Convex.
 */
export const ASSET_KEYS = {
  OVERBASE_ICON: "overbase-icon", // The filled logo used in AnswerCard
  OVERBASE_LOGO: "overbase-logo", // Full logo used in header/footer
} as const;

/**
 * Hook to get the current user's avatar URL from Convex.
 * Falls back to null if no user or avatar exists.
 */
export function useCurrentUserAvatar(): string | null {
  const user = useQuery(api.features.assets.getCurrentUser);
  return user?.avatarUrl ?? null;
}

/**
 * Hook to get a specific app asset URL by key.
 */
export function useAppAsset(key: string): string | null {
  const asset = useQuery(api.features.assets.getAssetByKey, { key });
  return asset?.imageUrl ?? null;
}

/**
 * Hook to get the Overbase icon URL (the AI avatar).
 */
export function useOverbaseIcon(): string | null {
  return useAppAsset(ASSET_KEYS.OVERBASE_ICON);
}

/**
 * Hook to get the Overbase logo URL (header/footer logo).
 */
export function useOverbaseLogo(): string | null {
  return useAppAsset(ASSET_KEYS.OVERBASE_LOGO);
}

/**
 * Combined hook for components that need both user avatar and Overbase icon.
 * Returns an object with both URLs for easy access.
 */
export function useAvatars(): {
  userAvatar: string | null;
  overbaseIcon: string | null;
  isLoading: boolean;
} {
  const user = useQuery(api.features.assets.getCurrentUser);
  const overbaseAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.OVERBASE_ICON,
  });

  // Consider it loading if either query hasn't resolved yet
  const isLoading = user === undefined || overbaseAsset === undefined;

  return {
    userAvatar: user?.avatarUrl ?? null,
    overbaseIcon: overbaseAsset?.imageUrl ?? null,
    isLoading,
  };
}
