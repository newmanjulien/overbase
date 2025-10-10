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
import { useRequest, useRequestActions } from "@/lib/requests/hooks";
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
  const { updateActive, promoteToActive, demoteToDraft, deleteRequest } =
    useRequestActions();

  const request = useRequest(user?.uid, requestId);

  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [repeat, setRepeat] = useState<RepeatRule["type"]>("none");

  const [errors, setErrors] = useState<{ scheduledDate?: string }>({});
  const hydratedRef = useRef(false);
  const minSelectable = useMemo(() => minSelectableDate(2), []);

  // prefill
  useEffect(() => {
    if (prefillDate) setScheduledDate(fromDateKey(prefillDate as DateKey));
  }, [prefillDate]);

  useEffect(() => {
    if (hydratedRef.current || !request) return;

    if (request.scheduledDate) setScheduledDate(request.scheduledDate);
    if (request.repeat && typeof request.repeat === "object") {
      setRepeat(request.repeat.type);
    }

    hydratedRef.current = true;
  }, [request]);

  const status = request?.status ?? "draft";

  const handleStatusChange = async (val: "draft" | "active") => {
    if (!user) return;
    if (val === "active") await promoteToActive(user.uid, requestId);
    else await demoteToDraft(user.uid, requestId);
  };

  const validate = () => {
    if (!scheduledDate) {
      setErrors({ scheduledDate: "Date required" });
      return false;
    }
    if (!isFutureDate(scheduledDate)) {
      setErrors({ scheduledDate: "Date must be in the future" });
      return false;
    }
    if (isBeforeDate(scheduledDate, minSelectable)) {
      setErrors({ scheduledDate: "Date must be at least 2 days in future" });
      return false;
    }
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
    if (mode === "create") {
      const confirmed = window.confirm(
        "Are you sure you want to return to the dashboard? Your request will not be created"
      );
      if (!confirmed) return;

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
