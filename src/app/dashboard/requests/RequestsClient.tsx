"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  today,
  toDateKey,
  fromDateKey,
  type DateKey,
} from "@/lib/requests/Dates";
import { useRouter } from "next/navigation";
import type { CalendarProps } from "@/components/layouts/CalendarSection";
import type { DataSectionProps } from "@/components/layouts/DataSection";
import { Requests } from "./Requests";
import { useDashboard } from "@/lib/dashboard/DashboardProvider";
import { useRequestActions } from "@/lib/requests/hooks";

export interface RequestOptions {
  prefillDate?: Date | null;
  mode?: "create" | "edit" | "editDraft";
}

export default function RequestsClient({ dateParam }: { dateParam?: string }) {
  const router = useRouter();

  const initialToday = today();
  const initialDate = dateParam
    ? fromDateKey(dateParam as DateKey)
    : initialToday;

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [nextRequestId, setNextRequestId] = useState<string | null>(null);
  const draftUsedRef = useRef(false);

  const { uid, requestsByDate } = useDashboard();
  const { ensureDraft, updateActive, maybeCleanupEphemeral } =
    useRequestActions();

  useEffect(() => {
    if (!uid) return;

    (async () => {
      try {
        const id = await ensureDraft(uid);
        setNextRequestId(id);
        router.prefetch(`/dashboard/requests/${id}/prompt`);
      } catch (err) {
        console.error("RequestsClient: ensureDraft failed", err);
      }
    })();

    return () => {
      if (!uid || !nextRequestId) return;
      if (draftUsedRef.current) return;
      maybeCleanupEphemeral(uid, nextRequestId).catch(() => {});
    };
  }, [uid, ensureDraft, maybeCleanupEphemeral, router, nextRequestId]);

  const handleRequestData = useCallback(
    async (options?: RequestOptions) => {
      if (!uid || !nextRequestId) return;

      const mode = options?.mode ?? "create";
      let url = `/dashboard/requests/${nextRequestId}/prompt?mode=${mode}`;

      if (options?.prefillDate) {
        url += `&date=${toDateKey(options.prefillDate)}`;
        try {
          await updateActive(uid, nextRequestId, {
            scheduledDate: options.prefillDate,
          });
        } catch (err) {
          console.warn("Failed to assign date to draft", err);
        }
      }

      try {
        router.prefetch(url);
      } catch {}
      draftUsedRef.current = true;
      router.push(url);
    },
    [uid, nextRequestId, router, updateActive]
  );

  const calendarProps = useMemo<CalendarProps>(
    () => ({
      selectedDate,
      setSelectedDate,
      currentDate,
      setCurrentDate,
      requestsByDate,
    }),
    [selectedDate, currentDate, requestsByDate]
  );

  const dataSectionProps = useMemo<DataSectionProps>(
    () => ({
      selectedDate,
      requestsByDate,
      onRequestData: handleRequestData,
    }),
    [selectedDate, requestsByDate, handleRequestData]
  );

  return (
    <Requests
      calendarProps={calendarProps}
      dataSectionProps={dataSectionProps}
      onRequestData={handleRequestData}
    />
  );
}
