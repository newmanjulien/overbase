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

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(
        `/dashboard/requests/${requestId}/questions?mode=${mode}${
          date ? `&date=${date}` : ""
        }`
      );
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [router, requestId, mode, date]);

  return <Loading />;
}
