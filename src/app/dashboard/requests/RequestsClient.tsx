"use client";

import { useState, useEffect, useRef } from "react";
import {
  today,
  toDateKey,
  fromDateKey,
  type DateKey,
} from "@/lib/requests/Dates";
import { useRouter } from "next/navigation";

import type { CalendarProps } from "../../../components/layouts/CalendarSection";
import type { DataSectionProps } from "../../../components/layouts/DataSection";
import { Requests } from "./Requests";

import { useAuth } from "@/lib/auth";
import { useRequestList, useRequestActions } from "@/lib/requests/hooks";
import LoadingScreen from "@/components/blocks/Loading";

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

  const { user, loading } = useAuth();
  const { requestsByDate } = useRequestList(user?.uid);
  const { ensureDraft, updateActive, maybeCleanupEphemeral } =
    useRequestActions();

  useEffect(() => {
    if (loading) return;
    if (!user?.uid) return;

    (async () => {
      try {
        const id = await ensureDraft(user.uid);
        setNextRequestId(id);
        router.prefetch(`/dashboard/requests/${id}/prompt`);
      } catch (err) {
        console.error("RequestsClient: ensureDraft failed", err);
      }
    })();
  }, [user?.uid, loading, ensureDraft, router]);

  // 🧹 Cleanup unused draft on unmount
  useEffect(() => {
    return () => {
      if (!user?.uid || !nextRequestId) return;
      if (draftUsedRef.current) return;
      maybeCleanupEphemeral(user.uid, nextRequestId).catch(() => {});
    };
  }, [user?.uid, nextRequestId, maybeCleanupEphemeral]);

  if (loading) return <LoadingScreen />;

  const handleRequestData = async (options?: RequestOptions) => {
    if (!user?.uid || !nextRequestId) return;

    const mode = options?.mode ?? "create";
    let url = `/dashboard/requests/${nextRequestId}/prompt?mode=${mode}`;
    if (options?.prefillDate) {
      url += `&date=${toDateKey(options.prefillDate)}`;
      try {
        await updateActive(user.uid, nextRequestId, {
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
  };

  const calendarProps: CalendarProps = {
    selectedDate,
    setSelectedDate,
    currentDate,
    setCurrentDate,
    requestsByDate,
  };

  const dataSectionProps: DataSectionProps = {
    selectedDate,
    requestsByDate,
    onRequestData: handleRequestData,
  };

  return (
    <Requests
      calendarProps={calendarProps}
      dataSectionProps={dataSectionProps}
      onRequestData={handleRequestData}
    />
  );
}
