"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  fromDateKey,
  toDateKey,
  minSelectableDate,
  isBeforeDate,
  isFutureDate,
  type DateKey,
} from "@/lib/requestDates";
import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/stores/useRequestStore";
import ScheduleUI from "./Schedule";

interface ScheduleClientProps {
  requestId: string;
  prefillDate?: string;
  mode: "create" | "edit" | "editDraft";
}

export default function ScheduleClient({
  requestId,
  prefillDate,
  mode,
}: ScheduleClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loadOne, updateActive } = useRequestListStore();

  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ scheduledDate?: string }>({});
  const minSelectable = useMemo(() => minSelectableDate(2), []);

  // prefill
  useEffect(() => {
    if (prefillDate) setScheduledDate(fromDateKey(prefillDate as DateKey));
  }, [prefillDate]);

  // hydrate from store
  useEffect(() => {
    if (!user) return;
    loadOne(user.uid, requestId);
  }, [user, requestId, loadOne]);

  useEffect(() => {
    const existing = requests[requestId];
    if (existing?.scheduledDate) setScheduledDate(existing.scheduledDate);
  }, [requests, requestId]);

  // auto-save
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      updateActive(user.uid, requestId, { scheduledDate });
    }, 800);
    return () => clearTimeout(timeout);
  }, [user, requestId, scheduledDate, updateActive]);

  const validate = () => {
    if (!scheduledDate)
      return setErrors({ scheduledDate: "Date required" }), false;
    if (!isFutureDate(scheduledDate))
      return setErrors({ scheduledDate: "Date must be in the future" }), false;
    if (isBeforeDate(scheduledDate, minSelectable))
      return (
        setErrors({ scheduledDate: "Date must be at least 2 days in future" }),
        false
      );
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) return;
    await updateActive(user.uid, requestId, { scheduledDate });
    router.push(
      `/dashboard/requests/${requestId}/loading?mode=${mode}&date=${toDateKey(
        scheduledDate!
      )}`
    );
  };

  const handleBack = () => {
    router.push(`/dashboard/requests/${requestId}/prompt?mode=${mode}`);
  };

  const handleHome = async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to return to the dashboard? Your changes will be deleted."
    );
    if (!confirmed) return;
    router.push(`/dashboard/requests`);
  };

  return (
    <ScheduleUI
      scheduledDate={scheduledDate}
      setScheduledDate={setScheduledDate}
      errors={errors}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onHome={handleHome}
      mode={mode}
      minSelectableDate={minSelectable}
    />
  );
}
