"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Loading from "./Loading";
import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/stores/useRequestStore";

type Props = {
  requestId: string;
  mode: "create" | "edit" | "editDraft";
  date?: string;
};

export default function LoadingClient({ requestId, mode, date }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loadOne } = useRequestListStore();

  const target = requests[requestId];
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchOnce = () => {
      if (!cancelled) {
        loadOne(user.uid!, requestId).catch((err) => {
          console.error("Failed to load request while waiting for summary", err);
        });
      }
    };

    fetchOnce();
    const interval = setInterval(fetchOnce, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, requestId, loadOne]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      router.push(
        `/dashboard/requests/${requestId}/confirm?mode=${mode}${
          date ? `&date=${date}` : ""
        }&error=summary_timeout`
      );
    }, 30_000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router, requestId, mode, date]);

  useEffect(() => {
    if (!target) return;

    if (target.summary && target.summary.trim().length > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.push(
        `/dashboard/requests/${requestId}/confirm?mode=${mode}${
          date ? `&date=${date}` : ""
        }`
      );
      return;
    }

    if (target.summaryStatus === "failed") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.push(
        `/dashboard/requests/${requestId}/confirm?mode=${mode}${
          date ? `&date=${date}` : ""
        }&error=summary`
      );
    }
  }, [target, router, requestId, mode, date]);

  const message = useMemo(() => {
    if (!target) return "Preparing your summary...";
    if (target.summaryStatus === "failed") {
      return "Summary generation failed.";
    }
    if (target.summary && target.summary.trim().length > 0) {
      return "Summary ready";
    }
    return "Summarising your request...";
  }, [target]);

  return <Loading message={message} />;
}
