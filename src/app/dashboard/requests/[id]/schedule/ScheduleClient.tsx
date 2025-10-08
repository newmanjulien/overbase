"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fromDateKey,
  toDateKey,
  minSelectableDate,
  isBeforeDate,
  isFutureDate,
  type DateKey,
  type RepeatRule,
  makeRepeatRule,
} from "@/lib/requests/Dates";
import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/requests/store";
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
  const [repeat, setRepeat] = useState<RepeatRule["type"]>("none");

  const [errors, setErrors] = useState<{ scheduledDate?: string }>({});
  const hydratedRef = useRef(false);
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

  // hydrate scheduledDate + repeat once when request loads
  // hydrate scheduledDate + repeat once when request loads
  useEffect(() => {
    if (hydratedRef.current) return;
    const record = requests[requestId];
    if (!record) return;

    if (record.scheduledDate) {
      setScheduledDate(record.scheduledDate);
    }

    if (
      record.repeat &&
      typeof record.repeat === "object" &&
      "type" in record.repeat
    ) {
      setRepeat(record.repeat.type);
    }

    hydratedRef.current = true;
  }, [requests, requestId]);

  // derive status from store
  const existing = requests[requestId];
  const status = existing?.status ?? "draft";

  const handleStatusChange = async (val: "draft" | "active") => {
    if (!user) return;
    if (val === "active") await promoteToActive(user.uid, requestId);
    else await demoteToDraft(user.uid, requestId);
  };

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

    // Build the structured rule from the selected repeat-type and scheduled date
    const rule = makeRepeatRule(repeat, scheduledDate);

    await updateActive(user.uid, requestId, {
      scheduledDate,
      repeat: rule,
    });

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

    if (mode === "create") {
      // Delete draft if we're still creating a new one
      if (user) {
        try {
          await deleteRequest(user.uid, requestId);
        } catch (err) {
          console.error("Failed to delete draft during back navigation", err);
        }
      }
    }

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
