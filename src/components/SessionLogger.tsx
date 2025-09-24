"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth"; // 👈 comes from your auth.tsx

export function SessionLogger() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("SessionLogger → user:", user);
    console.log("SessionLogger → loading:", loading);
  }, [user, loading]);

  return null; // invisible, just logs
}
