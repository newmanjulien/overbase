"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./Loading";

type Props = {
  requestId: string;
  mode: "create" | "edit" | "editDraft";
  date?: string;
};

export default function LoadingClient({ requestId, mode, date }: Props) {
  const router = useRouter();
  const duration = 5000; //5 seconds

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(
        `/dashboard/requests/${requestId}/confirm?mode=${mode}${
          date ? `&date=${date}` : ""
        }`
      );
    }, duration);

    return () => clearTimeout(timer);
  }, [router, requestId, mode, date, duration]);

  return <Loading duration={duration} />;
}
