"use client";

import { useState, useMemo, useCallback } from "react";
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
import { useDashboard } from "@/lib/dashboard/AdminProvider";
import { useRequestActions } from "@/lib/requests/hooks";
import { useEphemeralDraft } from "@/lib/requests/useEphemeralDraft";

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

  const { uid, requestsByDate } = useDashboard();
  const { updateActive } = useRequestActions();
  const { draftId, markDraftUsed } = useEphemeralDraft({ uid });

  const handleRequestData = useCallback(
    async (options?: RequestOptions) => {
      if (!uid || !draftId) return;

      const mode = options?.mode ?? "create";
      let url = `/dashboard/requests/${draftId}/prompt?mode=${mode}`;

      if (options?.prefillDate) {
        url += `&date=${toDateKey(options.prefillDate)}`;
        try {
          await updateActive(uid, draftId, {
            scheduledDate: options.prefillDate,
          });
        } catch (err) {
          console.warn("Failed to assign date to draft", err);
        }
      }

      try {
        router.prefetch(url);
      } catch {}
      markDraftUsed();
      router.push(url);
    },
    [uid, draftId, router, updateActive, markDraftUsed]
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
