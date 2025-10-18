"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequestActions } from "@/lib/requests/hooks";

interface UseEphemeralDraftOptions {
  uid: string | null;
}

interface UseEphemeralDraftReturn {
  /** The ID of the draft request (or null if not ready) */
  draftId: string | null;
  /** Mark that the draft has been used (prevents cleanup) */
  markDraftUsed: () => void;
  /** Whether the draft is ready */
  isReady: boolean;
}

/**
 * Hook to manage ephemeral draft creation and cleanup
 *
 * Creates a single ephemeral draft on mount and handles automatic cleanup
 * if the draft is not used (e.g., user navigates away before submitting).
 */
export function useEphemeralDraft({
  uid,
}: UseEphemeralDraftOptions): UseEphemeralDraftReturn {
  const router = useRouter();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const draftUsedRef = useRef(false);

  const { ensureDraft, maybeCleanupEphemeral } = useRequestActions();

  // Create or find existing draft on mount
  useEffect(() => {
    if (!uid) return;

    (async () => {
      try {
        const id = await ensureDraft(uid);
        setDraftId(id);
        setIsReady(true);
        // Prefetch the prompt page for better UX
        router.prefetch(`/dashboard/requests/${id}/prompt`);
      } catch (err) {
        console.error("useEphemeralDraft: ensureDraft failed", err);
        setIsReady(true); // Still mark as ready to avoid infinite loading
      }
    })();

    // Cleanup on unmount if draft wasn't used
    return () => {
      if (!uid || !draftId) return;
      if (draftUsedRef.current) return;
      maybeCleanupEphemeral(uid, draftId).catch(() => {});
    };
  }, [uid, ensureDraft, maybeCleanupEphemeral, router, draftId]);

  const markDraftUsed = useCallback(() => {
    draftUsedRef.current = true;
  }, []);

  return {
    draftId,
    markDraftUsed,
    isReady,
  };
}
