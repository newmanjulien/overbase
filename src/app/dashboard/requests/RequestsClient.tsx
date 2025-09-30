"use client";

import { useMemo, useState, useEffect } from "react";
import { today, toDateKey } from "@/lib/requestDates";
import { useRouter } from "next/navigation";

import type { CalendarProps } from "./Calendar";
import type { DataSectionProps } from "./DataSection";
import { Requests } from "./Requests";

import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/stores/useRequestListStore";

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

export default function RequestsClient() {
  const router = useRouter();
  const initialToday = today();

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialToday);
  const [currentDate, setCurrentDate] = useState<Date>(initialToday);

  const { user, loading } = useAuth();
  const { requestsByDate, createDraft, subscribe } = useRequestListStore();

  useEffect(() => {
    if (loading) return;
    if (!user?.uid) {
      console.warn("RequestsClient: no valid uid after loading", user?.uid);
      return;
    }
    try {
      const unsub = subscribe(user.uid);
      return () => unsub();
    } catch (err) {
      console.error("RequestsClient: subscribe failed", err);
    }
  }, [user?.uid, loading, subscribe]);

  // ✅ Conditional returns only after hooks
  if (loading) {
    return <div className="p-6 text-center">Loading requests…</div>;
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
    if (!user) return;
    const draft = await createDraft(user.uid, {
      scheduledDate: options?.prefillDate ?? null,
    });
    const mode = options?.mode ?? "create";
    let url = `/dashboard/requests/${draft.id}/setup?mode=${mode}`;
    if (options?.prefillDate) {
      url += `&date=${toDateKey(options.prefillDate)}`;
    }
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
