"use client";

import React, { createContext, useContext } from "react";
import { useAuth } from "@/lib/auth";
import LoadingScreen from "@/components/blocks/Loading";

interface DashboardContextValue {
  uid: string | null;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

export function DashboardAdminProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const uid = user?.uid ?? null;

  // ✅ 1. While auth is loading, show a global loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // ✅ 2. If no user, show a consistent "no auth" message
  if (!uid) {
    return (
      <div className="p-6 text-center text-gray-600">
        ⚠️ No authenticated user. Please sign in again.
      </div>
    );
  }

  const value: DashboardContextValue = {
    uid,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used within DashboardAdminProvider");
  return ctx;
}
