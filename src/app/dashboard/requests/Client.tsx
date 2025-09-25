"use client";

import { useMemo, useState } from "react";
import { today, toDateKey } from "@/lib/requestDates";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

import type { CalendarProps } from "./Calendar";
import type { DataSectionProps } from "./DataSection";
import { Requests } from "./Requests";

import { useAuth } from "@/lib/auth";
import { useUserRequests } from "@/lib/hooks/useUserRequests";
import { createRequestStore } from "@/lib/stores/useRequestStore";
import { getRequest } from "@/lib/services/requestService";

export interface RequestItem {
  id: string;
  prompt: string;
  scheduledDate: string;
  q1: string;
  q2: string;
  q3: string;
  status: "draft" | "active";
}

// 🔥 ADD: inline type for request handling
interface RequestOptions {
  prefillDate?: Date | null;
  mode?: "create" | "edit" | "editDraft";
}

export default function RequestsClient() {
  const router = useRouter();
  const initialToday = today();

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialToday);
  const [currentDate, setCurrentDate] = useState<Date>(initialToday);

  const { user } = useAuth();
  if (!user) {
    // Defensive guard: no user yet, render empty
    return null;
  }

  const { byDate } = useUserRequests();

  const requestsByDate: Record<string, RequestItem[]> = useMemo(() => {
    const out: Record<string, RequestItem[]> = {};
    for (const [key, list] of Object.entries(byDate)) {
      out[key] = list.map((r) => ({
        id: r.id,
        prompt: r.prompt,
        scheduledDate: key,
        q1: r.q1 ?? "",
        q2: r.q2 ?? "",
        q3: r.q3 ?? "",
        status: r.status,
      }));
    }
    return out;
  }, [byDate]);

  // 🔥 CHANGED: accept RequestOptions instead of just prefillDate
  const handleRequestData = (options?: RequestOptions) => {
    const id = uuidv4();
    const mode = options?.mode ?? "create"; // default create mode
    let url = `/dashboard/requests/${id}/setup?mode=${mode}`;

    if (options?.prefillDate) {
      url += `&date=${toDateKey(options.prefillDate)}`; // 🔥 CHANGED: use & not ?
    }

    router.push(url);
  };

  const handleEdit = async (requestId: string) => {
    const store = createRequestStore(requestId);
    const { setAllData, setStep } = store();
    const existing = await getRequest(user.uid, requestId);
    if (existing) {
      setAllData(existing);
      setStep(1);
    }
    router.push(`/dashboard/requests/${requestId}/setup`);
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
    onRequestData: handleRequestData, // 🔥 CHANGED
  };

  return (
    <Requests
      calendarProps={calendarProps}
      dataSectionProps={dataSectionProps}
      onRequestData={handleRequestData} // 🔥 CHANGED
    />
  );
}
