"use client";

import React, { createContext, useContext } from "react";
import { useAuth } from "@/lib/auth";
import { useRequestList } from "@/lib/requests/hooks";
import LoadingScreen from "@/components/blocks/Loading";

interface DashboardContextValue {
  uid: string;
  requests: Record<string, any>;
  requestsByDate: Record<string, any[]>;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const uid = user?.uid;

  // ✅ 1. While auth is loading, show a global loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // ✅ 2. If no user, show a consistent “no auth” message
  if (!uid) {
    return (
      <div className="p-6 text-center text-gray-600">
        ⚠️ No authenticated user. Please sign in again.
      </div>
    );
  }

  // ✅ 3. Once auth is ready, safely subscribe to Firestore
  const { requests, requestsByDate } = useRequestList(uid);

  const value: DashboardContextValue = {
    uid,
    requests,
    requestsByDate,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
