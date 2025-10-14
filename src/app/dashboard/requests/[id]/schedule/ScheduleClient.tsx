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
import { useDashboard } from "@/lib/dashboard/AdminProvider";
import { useRequestActions } from "@/lib/requests/hooks";
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
  const { uid, requests } = useDashboard();
  const { updateActive, promoteToActive, demoteToDraft, deleteRequest } =
    useRequestActions();

  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [repeat, setRepeat] = useState<RepeatRule["type"]>("none");

  const [errors, setErrors] = useState<{ scheduledDate?: string }>({});
  const hydratedRef = useRef(false);
  const minSelectable = useMemo(() => minSelectableDate(2), []);

  // prefill
  useEffect(() => {
    if (prefillDate) setScheduledDate(fromDateKey(prefillDate as DateKey));
  }, [prefillDate]);

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
    if (!uid) return;
    if (val === "active") await promoteToActive(uid, requestId);
    else await demoteToDraft(uid, requestId);
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

  // const handleSubmit = async () => {
  //   if (!validate()) return;
  //   if (!uid) return;

  //   // Build the structured rule from the selected repeat-type and scheduled date
  //   const rule = makeRepeatRule(repeat, scheduledDate);

  //   await updateActive(uid, requestId, {
  //     scheduledDate,
  //     repeat: rule,
  //   });

  //   router.push(
  //     `/dashboard/requests/${requestId}/loading?mode=${mode}&date=${toDateKey(
  //       scheduledDate!
  //     )}`
  //   );
  // };

  const handleSubmit = async () => {
    if (!validate() || !uid) return;
    const rule = makeRepeatRule(repeat, scheduledDate);

    await updateActive(uid, requestId, { scheduledDate, repeat: rule });

    if (mode === "create") {
      router.push(
        `/dashboard/requests/${requestId}/loading?mode=${mode}&date=${toDateKey(
          scheduledDate!
        )}`
      );
    } else {
      // ✅ Go straight to Questions step for edit/editDraft
      router.push(
        `/dashboard/requests/${requestId}/questions?mode=${mode}&date=${toDateKey(
          scheduledDate!
        )}`
      );
    }
  };

  const handleDelete = async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this request?"
    );
    if (!confirmed) return;
    if (uid) {
      await deleteRequest(uid, requestId);
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

      if (uid) {
        try {
          await deleteRequest(uid, requestId);
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
