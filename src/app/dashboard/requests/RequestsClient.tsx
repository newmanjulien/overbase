"use client";

import { useState, useEffect, useRef } from "react";
import {
  today,
  toDateKey,
  fromDateKey,
  type DateKey,
} from "@/lib/requestDates";
import { useRouter } from "next/navigation";

import type { CalendarProps } from "./Calendar";
import type { DataSectionProps } from "./DataSection";
import { Requests } from "./Requests";

import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/requests/store";
import LoadingScreen from "@/components/blocks/Loading";

export interface RequestItem {
  id: string;
  prompt: string;
  scheduledDate: Date | null;
  summary: string;
  status: "draft" | "active";
  ephemeral?: boolean;
}

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
  const {
    requestsByDate,
    ensureDraft,
    updateActive,
    subscribe,
    maybeCleanupEphemeral,
  } = useRequestListStore();

  useEffect(() => {
    if (loading) return;
    if (!user?.uid) {
      console.warn("RequestsClient: no valid uid after loading", user?.uid);
      return;
    }

    try {
      const unsub = subscribe(user.uid);

      // Ensure a single draft exists, set it as nextRequestId
      (async () => {
        try {
          const id = await ensureDraft(user.uid);
          setNextRequestId(id);
          router.prefetch(`/dashboard/requests/${id}/prompt`);
        } catch (err) {
          console.error("RequestsClient: ensureDraft failed", err);
        }
      })();

      return () => unsub();
    } catch (err) {
      console.error("RequestsClient: subscribe failed", err);
    }
  }, [user?.uid, loading, subscribe, ensureDraft, router]);

  // 🧹 Cleanup unused draft on unmount
  useEffect(() => {
    return () => {
      if (!user?.uid || !nextRequestId) return;
      if (draftUsedRef.current) return;
      maybeCleanupEphemeral(user.uid, nextRequestId).catch(() => {});
    };
  }, [user?.uid, nextRequestId, maybeCleanupEphemeral]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-600">
        ⚠️ No authenticated user. Please check your Firebase setup or try again
        later.
      </div>
    );
  }

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
