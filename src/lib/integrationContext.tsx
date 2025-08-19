"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Integration } from "../app/dashboard/integrations/DummyData";

interface IntegrationContextType {
  installedIntegrations: Integration[];
  addIntegration: (integration: Integration) => void;
  removeIntegration: (id: string) => void;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(
  undefined
);

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [installedIntegrations, setInstalledIntegrations] = useState<
    Integration[]
  >([]);

  const addIntegration = (integration: Integration) => {
    setInstalledIntegrations((prev) =>
      prev.some((i) => i.id === integration.id) ? prev : [...prev, integration]
    );
  };

  const removeIntegration = (id: string) => {
    setInstalledIntegrations((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <IntegrationContext.Provider
      value={{ installedIntegrations, addIntegration, removeIntegration }}
    >
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegrationContext() {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error(
      "useIntegrationContext must be used within IntegrationProvider"
    );
  }
  return context;
}
