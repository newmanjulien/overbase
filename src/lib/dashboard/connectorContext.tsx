"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Connectors } from "@/app/dashboard/connectors/DummyData";

interface ConnectorContextType {
  addedConnectors: Connectors[];
  addConnector: (connector: Connectors) => void;
  removeConnector: (id: string) => void;
}

const ConnectorContext = createContext<ConnectorContextType | undefined>(
  undefined
);

export function ConnectorProvider({ children }: { children: ReactNode }) {
  const [addedConnectors, setAddedConnectors] = useState<Connectors[]>([]);

  const addConnector = (connector: Connectors) => {
    setAddedConnectors((prev) =>
      prev.some((i) => i.id === connector.id) ? prev : [...prev, connector]
    );
  };

  const removeConnector = (id: string) => {
    setAddedConnectors((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <ConnectorContext.Provider
      value={{ addedConnectors, addConnector, removeConnector }}
    >
      {children}
    </ConnectorContext.Provider>
  );
}

export function useConnectorContext() {
  const context = useContext(ConnectorContext);
  if (!context) {
    throw new Error(
      "useConnectorContext must be used within ConnectorProvider"
    );
  }
  return context;
}
