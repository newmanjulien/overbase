"use client";

import { useState, useEffect } from "react";
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
import { useRequestListStore } from "@/lib/stores/useRequestStore";
import { v4 as uuid } from "uuid";
import LoadingScreen from "@/components/blocks/LoadingScreen";

export interface RequestItem {
  id: string;
  prompt: string;
  scheduledDate: Date | null;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
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

  const { user, loading } = useAuth();
  const { requestsByDate, createDraft, subscribe } = useRequestListStore();

  useEffect(() => {
    if (loading) return;
    if (!user?.uid) {
      console.warn("RequestsClient: no valid uid after loading", user?.uid);
      return;
    }

    if (!nextRequestId) {
      setNextRequestId(uuid());
    }

    try {
      const unsub = subscribe(user.uid);
      return () => unsub();
    } catch (err) {
      console.error("RequestsClient: subscribe failed", err);
    }
  }, [user?.uid, loading, subscribe, nextRequestId]);

  useEffect(() => {
    if (!user?.uid || !nextRequestId) return;

    try {
      router.prefetch(`/dashboard/requests/${nextRequestId}/setup`);
    } catch (err) {
      console.error("Prefetch failed", err);
    }
  }, [user?.uid, nextRequestId]);

  // ✅ Conditional returns only after hooks
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

  const handleRequestData = (options?: RequestOptions) => {
    if (!user || !nextRequestId) return;

    const mode = options?.mode ?? "create";

    let url = `/dashboard/requests/${nextRequestId}/setup?mode=${mode}`;
    if (options?.prefillDate) {
      url += `&date=${toDateKey(options.prefillDate)}`;
    }

    try {
      router.prefetch(url);
    } catch {
      // swallow errors, since prefetch is best effort
    }
    router.push(url);

    createDraft(
      user.uid,
      { scheduledDate: options?.prefillDate ?? null },
      nextRequestId
    ).catch((err) => {
      console.error("Failed to create draft", err);
    });

    setNextRequestId(uuid());
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
