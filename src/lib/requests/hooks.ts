// hooks.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase/firebase-client";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
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
/* 🔹 useRequestList — replaces store.subscribe + store.requestsByDate         */
/* -------------------------------------------------------------------------- */

export function useRequestList(uid: string | null) {
  const [requests, setRequests] = useState<Record<string, Request>>({});
  const [requestsByDate, setRequestsByDate] = useState<
    Record<string, Request[]>
  >({});

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "users", uid, "requests").withConverter(
        requestReadConverterClient
      ),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const next: Record<string, Request> = {};
      snap.forEach((doc) => {
        const data = doc.data();
        if (data) next[data.id] = data;
      });
      setRequests(next);

      // Build requestsByDate (for Calendar + DataSection views)
      const map: Record<string, Request[]> = {};
      for (const r of Object.values(next)) {
        if (!r?.scheduledDate) continue;
        const allDates = [
          r.scheduledDate,
          ...expandRepeatDates(r.scheduledDate, r.repeat, 24),
        ];
        for (const d of allDates) {
          const key = toDateKey(d);
          (map[key] ??= []).push({ ...r, scheduledDate: d });
        }
      }
      setRequestsByDate(map);
    });

    return () => unsub();
  }, [uid]);

  return { requests, requestsByDate };
}

/* -------------------------------------------------------------------------- */
/* 🔹 useRequest — replaces store.loadOne + store.requests[id]                */
/* -------------------------------------------------------------------------- */

export function useRequest(uid: string | undefined, id: string | undefined) {
  const [request, setRequest] = useState<Request | null>(null);

  useEffect(() => {
    if (!uid || !id) return;
    const ref = doc(db, "users", uid, "requests", id).withConverter(
      requestReadConverterClient
    );

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setRequest(snap.data() as Request);
      else setRequest(null);
    });

    return () => unsub();
  }, [uid, id]);

  return request;
}

/* -------------------------------------------------------------------------- */
/* 🔹 useRequestActions — wraps existing service-Client functions             */
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

  // 🧹 New helper: delete ephemeral drafts if they’re empty
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
      maybeCleanupEphemeral: maybeCleanupEphemeralCb, // 👈 new method exported
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
