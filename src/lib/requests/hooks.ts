// hooks.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase/firebase-client";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
import type { Request, RequestPatch } from "./model-Types";
import { toDateKey, expandRepeatDates } from "./Dates";
import { requestReadConverterClient } from "./model-Client";

import {
  ensureDraft,
  updateActive,
  promoteToActive,
  demoteToDraft,
  deleteRequest,
  loadOne as svcLoadOne,
} from "./service-Client";

/* -------------------------------------------------------------------------- */
/* 🔹 useRequests — unified hook for all requests (list + by-date + hydration) */
/* -------------------------------------------------------------------------- */

export function useRequests(uid: string | null) {
  const [requests, setRequests] = useState<Record<string, Request>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!uid) return;

    setHydrated(false);

    const q = query(
      collection(db, "users", uid, "requests").withConverter(
        requestReadConverterClient
      ),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Record<string, Request> = {};
        snap.forEach((doc) => {
          const data = doc.data();
          if (data) next[data.id] = data;
        });
        setRequests(next);
        setHydrated(true);
      },
      (err) => {
        console.error("useRequests snapshot error:", err);
        setHydrated(true);
      }
    );

    return () => unsub();
  }, [uid]);

  /* ---------------------------------------------------------------------- */
  /* 🧠 Memoized computation of requestsByDate                              */
  /* ---------------------------------------------------------------------- */
  const requestsByDate = useMemo(() => {
    // Don't recompute if there are no requests
    if (!Object.keys(requests).length) return {};

    const map: Record<string, Request[]> = {};
    for (const r of Object.values(requests)) {
      if (!r?.scheduledDate) continue;

      // Precompute all occurrence dates (base + repeats)
      const allDates = [
        r.scheduledDate,
        ...expandRepeatDates(r.scheduledDate, r.repeat, 24),
      ];

      // Group by date key
      for (const d of allDates) {
        const key = toDateKey(d);
        (map[key] ??= []).push({ ...r, scheduledDate: d });
      }
    }

    return map;
  }, [requests]);

  /* ---------------------------------------------------------------------- */
  /* 🧩 Helper to get one request without creating another listener         */
  /* ---------------------------------------------------------------------- */
  const getRequest = useCallback(
    (id: string | undefined) => (id ? requests[id] ?? null : null),
    [requests]
  );

  return { requests, requestsByDate, getRequest, hydrated };
}

/* -------------------------------------------------------------------------- */
/* 🔹 useRequestActions — Firestore write operations                         */
/* -------------------------------------------------------------------------- */

export function useRequestActions() {
  const ensureDraftCb = useCallback((uid: string) => ensureDraft(uid), []);

  const updateActiveCb = useCallback(
    (uid: string, id: string, patch: RequestPatch) =>
      updateActive(uid, id, patch),
    []
  );

  const promoteToActiveCb = useCallback(
    (uid: string, id: string) => promoteToActive(uid, id),
    []
  );

  const demoteToDraftCb = useCallback(
    (uid: string, id: string) => demoteToDraft(uid, id),
    []
  );

  const deleteRequestCb = useCallback(
    (uid: string, id: string) => deleteRequest(uid, id),
    []
  );

  const loadOneCb = useCallback(
    (uid: string, id: string) => svcLoadOne(uid, id),
    []
  );

  // 🧹 Deletes ephemeral drafts if empty
  const maybeCleanupEphemeralCb = useCallback(
    async (uid: string, id: string) => {
      try {
        const draft = await svcLoadOne(uid, id);
        if (
          draft &&
          draft.status === "draft" &&
          draft.ephemeral === true &&
          !draft.prompt &&
          !draft.customer
        ) {
          await deleteRequest(uid, id);
        }
      } catch (err) {
        console.warn("maybeCleanupEphemeral: failed", err);
      }
    },
    []
  );

  return useMemo(
    () => ({
      ensureDraft: ensureDraftCb,
      updateActive: updateActiveCb,
      promoteToActive: promoteToActiveCb,
      demoteToDraft: demoteToDraftCb,
      deleteRequest: deleteRequestCb,
      loadOne: loadOneCb,
      maybeCleanupEphemeral: maybeCleanupEphemeralCb,
    }),
    [
      ensureDraftCb,
      updateActiveCb,
      promoteToActiveCb,
      demoteToDraftCb,
      deleteRequestCb,
      loadOneCb,
      maybeCleanupEphemeralCb,
    ]
  );
}
