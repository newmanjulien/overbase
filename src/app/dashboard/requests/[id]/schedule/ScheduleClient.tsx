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
  const {
    requests,
    loadOne,
    updateActive,
    promoteToActive,
    demoteToDraft,
    deleteRequest,
  } = useRequestListStore();

  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [repeat, setRepeat] = useState<string>("Does not repeat");

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

  // hydrate scheduledDate + repeat when request loads
  useEffect(() => {
    const existing = requests[requestId];
    if (existing?.scheduledDate) setScheduledDate(existing.scheduledDate);
    if (existing?.repeat) setRepeat(existing.repeat);
  }, [requests, requestId]);

  // derive status from store
  const existing = requests[requestId];
  const status = existing?.status ?? "draft";

  const handleStatusChange = async (val: "draft" | "active") => {
    if (!user) return;
    if (val === "active") await promoteToActive(user.uid, requestId);
    else await demoteToDraft(user.uid, requestId);
  };

  // auto-save
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      updateActive(user.uid, requestId, { scheduledDate, repeat });
    }, 800);
    return () => clearTimeout(timeout);
  }, [user, requestId, scheduledDate, repeat, updateActive]);

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
    await updateActive(user.uid, requestId, { scheduledDate, repeat });
    router.push(
      `/dashboard/requests/${requestId}/loading?mode=${mode}&date=${toDateKey(
        scheduledDate!
      )}`
    );
  };

  const handleDelete = async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this request?"
    );
    if (!confirmed) return;
    if (user) {
      await deleteRequest(user.uid, requestId);
    }
    router.push(`/dashboard/requests`);
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
      repeat={repeat}
      setRepeat={setRepeat}
      errors={errors}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onHome={handleHome}
      mode={mode}
      minSelectableDate={minSelectable}
      status={status}
      setStatus={mode !== "create" ? handleStatusChange : undefined}
      onDelete={handleDelete}
    />
  );
}
