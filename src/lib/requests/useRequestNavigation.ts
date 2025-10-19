"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequestActions } from "@/lib/requests/hooks";
import type { Request } from "@/lib/requests/model-Types";

interface UseRequestNavigationOptions {
  requestId: string;
  mode: "create" | "edit" | "editDraft";
  uid: string | null;
  existing?: Request | null;
}

export function useRequestNavigation({
  requestId,
  mode,
  uid,
  existing,
}: UseRequestNavigationOptions) {
  const router = useRouter();
  const { deleteRequest, promoteToActive, demoteToDraft } = useRequestActions();

  // Derive status from the request
  const status = existing?.status ?? "draft";

  /**
   * Navigate to dashboard home, with confirmation and cleanup for create mode
   */
  const handleHome = useCallback(async (): Promise<void> => {
    if (mode === "create") {
      const confirmed = window.confirm(
        "Are you sure you want to return to the dashboard? Your request will not be created"
      );
      if (!confirmed) return;

      if (uid) {
        try {
          await deleteRequest(uid, requestId);
        } catch (err) {
          console.error("Failed to delete draft during back navigation", err);
        }
      }
    }

    router.push(`/dashboard/requests`);
  }, [mode, uid, requestId, router, deleteRequest]);

  /**
   * Permanently delete the request with confirmation
   */
  const handleDelete = useCallback(async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this request?"
    );
    if (!confirmed) return;

    if (uid) {
      await deleteRequest(uid, requestId);
    }
    router.push(`/dashboard/requests`);
  }, [uid, requestId, router, deleteRequest]);

  /**
   * Toggle request status between draft and active
   * Only available in edit modes (not create)
   */
  const handleStatusChange = useCallback(
    async (val: "draft" | "active") => {
      if (!uid) return;
      if (val === "active") {
        await promoteToActive(uid, requestId);
      } else {
        await demoteToDraft(uid, requestId);
      }
    },
    [uid, requestId, promoteToActive, demoteToDraft]
  );

  return {
    status,
    handleHome,
    handleDelete,
    // Only expose status change handler in edit modes
    handleStatusChange: mode !== "create" ? handleStatusChange : undefined,
  };
}
