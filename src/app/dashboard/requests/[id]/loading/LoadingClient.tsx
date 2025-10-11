"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Loading from "./Loading";
import { useDashboard } from "@/lib/dashboard/DashboardProvider";

type Props = {
  requestId: string;
  mode: "create" | "edit" | "editDraft";
  date?: string;
};

export default function LoadingClient({ requestId, mode, date }: Props) {
  const router = useRouter();
  const { requests } = useDashboard();

  const target = requests[requestId];
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      router.push(
        `/dashboard/requests/${requestId}/questions?mode=${mode}${
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
        `/dashboard/requests/${requestId}/questions?mode=${mode}${
          date ? `&date=${date}` : ""
        }`
      );
      return;
    }

    if (target.summaryStatus === "failed") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.push(
        `/dashboard/requests/${requestId}/questions?mode=${mode}${
          date ? `&date=${date}` : ""
        }&error=summary`
      );
    }
  }, [target, router, requestId, mode, date]);

  return <Loading />;
}
