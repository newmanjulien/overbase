"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useRequestListStore } from "@/lib/stores/useRequestStore";
import { toDateKey } from "@/lib/requestDates";
import Loading from "./Loading";

interface LoadingClientProps {
  requestId: string;
  prefillDate?: string;
  mode: "create" | "edit" | "editDraft";
}

export default function LoadingClient({
  requestId,
  prefillDate,
  mode,
}: LoadingClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loadOne, updateActive } = useRequestListStore();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!user) return;
    loadOne(user.uid, requestId);
  }, [user, requestId, loadOne]);

  useEffect(() => {
    if (!user || hasStarted.current) return;

    const existing = requests[requestId];
    if (!existing?.prompt) return;

    hasStarted.current = true;

    const generateSummary = async () => {
      try {
        const response = await fetch("/summarise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: existing.prompt }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate summary");
        }

        const { text: summary } = await response.json();

        await updateActive(user.uid, requestId, { summary });

        const dateParam = existing.scheduledDate
          ? `&date=${toDateKey(existing.scheduledDate)}`
          : "";

        router.push(
          `/dashboard/requests/${requestId}/confirm?mode=${mode}${dateParam}`
        );
      } catch (error) {
        console.error("Failed to generate summary:", error);
        alert("Failed to generate summary. Please try again.");
        const dateParam = existing.scheduledDate
          ? `&date=${toDateKey(existing.scheduledDate)}`
          : "";
        router.push(
          `/dashboard/requests/${requestId}/setup?mode=${mode}${dateParam}`
        );
      }
    };

    generateSummary();
  }, [user, requests, requestId, updateActive, router, mode]);

  return <Loading />;
}