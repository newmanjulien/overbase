"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardUIContextValue {
  hideFooter: boolean;
  setHideFooter: (hide: boolean) => void;
  // 🧩 You can easily extend this later:
  // sidebarOpen: boolean;
  // setSidebarOpen: (open: boolean) => void;
  // darkMode: boolean;
  // toggleDarkMode: () => void;
}

const DashboardUIContext = createContext<DashboardUIContextValue | undefined>(
  undefined
);

export function useDashboardUI(): DashboardUIContextValue {
  const ctx = useContext(DashboardUIContext);
  if (!ctx)
    throw new Error("useDashboardUI must be used within a DashboardUIProvider");
  return ctx;
}

export function DashboardUIProvider({ children }: { children: ReactNode }) {
  const [hideFooter, setHideFooter] = useState(false);

  const value: DashboardUIContextValue = {
    hideFooter,
    setHideFooter,
  };

  return (
    <DashboardUIContext.Provider value={value}>
      {children}
    </DashboardUIContext.Provider>
  );
}
